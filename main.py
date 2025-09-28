
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np, cv2, tempfile, os, json
from sklearn.cluster import KMeans
try:
    import ezdxf
except Exception:
    ezdxf = None

app = FastAPI(title="Offline Floorplan CV Generator")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def read_image_bytes(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img

def to_gray(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def auto_canny(img_gray, sigma=0.33):
    v = np.median(img_gray)
    lower = int(max(0, (1.0 - sigma) * v))
    upper = int(min(255, (1.0 + sigma) * v))
    return cv2.Canny(img_gray, lower, upper)

def detect_outer_contour(img):
    gray = to_gray(img)
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    th = cv2.adaptiveThreshold(blur,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11,2)
    if np.mean(th) > 127:
        th = 255 - th
    cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return None
    cnt = max(cnts, key=cv2.contourArea)
    epsilon = 0.01 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    x, y, w, h = cv2.boundingRect(approx)
    return {"poly": approx.reshape(-1,2).tolist(), "bbox": [int(x),int(y),int(w),int(h)], "area_px": int(cv2.contourArea(cnt))}

def detect_walls_lines(img):
    gray = to_gray(img)
    edges = auto_canny(gray)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    lines = cv2.HoughLinesP(closed, rho=1, theta=np.pi/180, threshold=80, minLineLength=30, maxLineGap=10)
    out = []
    if lines is not None:
        for l in lines:
            x1,y1,x2,y2 = l[0].tolist()
            out.append({"x1":int(x1),"y1":int(y1),"x2":int(x2),"y2":int(y2)})
    return out

def detect_openings(img):
    gray = to_gray(img)
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    _, th = cv2.threshold(blur, 200, 255, cv2.THRESH_BINARY)
    cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    openings = []
    for cnt in cnts:
        x,y,w,h = cv2.boundingRect(cnt)
        area = w*h
        if area < 200:
            continue
        ratio = w / (h + 1e-6)
        if 0.3 < ratio < 3 and area > 400:
            openings.append({"x":int(x),"y":int(y),"w":int(w),"h":int(h)})
    return openings

def segment_rooms_by_clustering(img, n_clusters=4):
    small = cv2.resize(img, (200, 200))
    data = small.reshape((-1,3)).astype(np.float32)
    kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(data)
    labels = kmeans.labels_.reshape((200,200)).astype(np.uint8)
    labels_up = cv2.resize(labels, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
    return labels_up

def extract_room_contours_from_labels(labels):
    rooms = []
    unique = np.unique(labels)
    for lab in unique:
        mask = (labels == lab).astype(np.uint8) * 255
        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in cnts:
            x,y,w,h = cv2.boundingRect(cnt)
            if w*h < 1000:
                continue
            rooms.append({"bbox":[int(x),int(y),int(w),int(h)], "area_px": int(w*h)})
    merged = []
    for r in rooms:
        rx,ry,rw,rh = r["bbox"]
        merged_flag = False
        for m in merged:
            mx,my,mw,mh = m["bbox"]
            if not (rx > mx+mw or rx+rw < mx or ry > my+mh or ry+rh < my):
                nx = min(rx,mx); ny = min(ry,my)
                nw = max(rx+rw, mx+mw) - nx
                nh = max(ry+rh, my+mh) - ny
                m["bbox"] = [nx,ny,nw,nh]
                merged_flag = True
                break
        if not merged_flag:
            merged.append(dict(r))
    return merged

def compute_scale(plot_bbox_px, plot_width_m=None, plot_height_m=None, scale_bar_px=None, scale_bar_m=None):
    if scale_bar_px and scale_bar_m:
        return float(scale_bar_m) / float(scale_bar_px)
    if plot_width_m:
        px_w = plot_bbox_px[2]
        return float(plot_width_m) / float(px_w)
    if plot_height_m:
        px_h = plot_bbox_px[3]
        return float(plot_height_m) / float(px_h)
    return None

def build_dxf(layout, plot_w_m, plot_h_m, out_path):
    if ezdxf is None:
        raise RuntimeError("ezdxf not installed.")
    scale = 1000.0
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    pts = [(0,0),(plot_w_m*scale,0),(plot_w_m*scale,plot_h_m*scale),(0,plot_h_m*scale),(0,0)]
    msp.add_lwpolyline(pts, dxfattribs={'closed':True})
    for r in layout:
        x = r["x_m"] * scale
        y = r["y_m"] * scale
        w = r["w_m"] * scale
        h = r["h_m"] * scale
        msp.add_lwpolyline([(x,y),(x+w,y),(x+w,y+h),(x,y+h),(x,y)], dxfattribs={'closed':True})
        msp.add_text(f\"{r['name']} {round(r['w_m'],2)}x{round(r['h_m'],2)}m\", dxfattribs={'height':100}).set_pos((x+10,y+10))
    doc.saveas(out_path)

@app.post('/api/process')
async def process(file: UploadFile = File(...), plot_width_m: float = Form(None), plot_height_m: float = Form(None), scale_bar_px: float = Form(None), scale_bar_m: float = Form(None), k_clusters: int = Form(4)):
    img_bytes = await file.read()
    img = read_image_bytes(img_bytes)
    if img is None:
        return JSONResponse({'error':'could-not-read-image'}, status_code=400)
    h_img, w_img = img.shape[:2]
    plot = detect_outer_contour(img)
    if not plot:
        return JSONResponse({'error':'could-not-detect-plot-outer-boundary'}, status_code=400)
    plot_bbox = plot['bbox']
    wall_lines = detect_walls_lines(img)
    openings = detect_openings(img)
    labels = segment_rooms_by_clustering(img, n_clusters=k_clusters)
    candidate_rooms = extract_room_contours_from_labels(labels)
    meters_per_px = compute_scale(plot_bbox_px=plot_bbox, plot_width_m=plot_width_m, plot_height_m=plot_height_m, scale_bar_px=scale_bar_px, scale_bar_m=scale_bar_m)
    if meters_per_px is None:
        return JSONResponse({'error':'no_scale_provided','message':'Provide plot_width_m/plot_height_m or scale_bar_px+scale_bar_m','plot_bbox_px':plot_bbox,'candidate_rooms_px':candidate_rooms,'wall_lines_px':wall_lines,'openings_px':openings}, status_code=400)
    px_to_m = meters_per_px
    layout = []
    for i, r in enumerate(candidate_rooms):
        x_px,y_px,w_px,h_px = r['bbox']
        rel_x_px = x_px - plot_bbox[0]
        rel_y_px = y_px - plot_bbox[1]
        x_m = rel_x_px * px_to_m
        y_m = rel_y_px * px_to_m
        w_m = w_px * px_to_m
        h_m = h_px * px_to_m
        layout.append({'name':f'Room_{i+1}','bbox_px':[int(x_px),int(y_px),int(w_px),int(h_px)],'x_m':round(x_m,4),'y_m':round(y_m,4),'w_m':round(w_m,4),'h_m':round(h_m,4),'area_m2':round(w_m*h_m,4)})
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.dxf')
    tmp.close()
    try:
        build_dxf(layout, plot_width_m if plot_width_m else (plot_bbox[2]*px_to_m), plot_height_m if plot_height_m else (plot_bbox[3]*px_to_m), tmp.name)
    except Exception as e:
        return JSONResponse({'error':'dxf_failed','details':str(e),'layout':layout})
    return JSONResponse({'plot_bbox_px':plot_bbox,'meters_per_px':px_to_m,'layout':layout,'wall_lines':wall_lines,'openings':openings,'dxf_path':tmp.name})

@app.get('/api/download')
async def download(file: str):
    if not file or '..' in file:
        return JSONResponse({'error':'invalid file param'}, status_code=400)
    if not os.path.exists(file):
        return JSONResponse({'error':'file not found'}, status_code=404)
    return FileResponse(path=file, filename=os.path.basename(file), media_type='application/dxf')
