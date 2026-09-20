const express=require("express");
const path=require("path");
const fs=require("fs");
const multer=require("multer");

const app=express();
const PORT=process.env.PORT||3000;
const ADMIN_KEY=process.env.ADMIN_KEY||"change-this-key";
const root=__dirname;
const uploadDir=path.join(root,"uploads");
const dataFile=path.join(root,"matin-data.json");

fs.mkdirSync(uploadDir,{recursive:true});

const emptyData={posts:[],views:[],projects:[],games:[]};

function loadData(){
  try{
    if(!fs.existsSync(dataFile)){
      fs.writeFileSync(dataFile,JSON.stringify(emptyData,null,2),"utf8");
      return JSON.parse(JSON.stringify(emptyData));
    }
    const raw=fs.readFileSync(dataFile,"utf8");
    const data=JSON.parse(raw);
    return {
      posts:Array.isArray(data.posts)?data.posts:[],
      views:Array.isArray(data.views)?data.views:[],
      projects:Array.isArray(data.projects)?data.projects:[],
      games:Array.isArray(data.games)?data.games:[]
    };
  }catch(e){
    console.error("Data read error:",e.message);
    return JSON.parse(JSON.stringify(emptyData));
  }
}

function saveData(data){
  fs.writeFileSync(dataFile,JSON.stringify(data,null,2),"utf8");
}

function nextId(items){
  return items.reduce((m,x)=>Math.max(m,Number(x.id)||0),0)+1;
}

app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(uploadDir));
app.use(express.static(path.join(root,"public")));

const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,uploadDir),
  filename:(req,file,cb)=>{
    const safe=file.originalname.replace(/[^a-zA-Z0-9._-]/g,"_");
    cb(null,Date.now()+"_"+safe);
  }
});
const upload=multer({storage,limits:{fileSize:200*1024*1024}});

function admin(req,res,next){
  const key=req.headers["x-admin-key"]||req.body.adminKey;
  if(key!==ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  next();
}

app.post("/api/track",(req,res)=>{
  const data=loadData();
  const page=String(req.body.page||"/").slice(0,200);
  const ua=req.headers["user-agent"]||"";
  const device=/mobile|android|iphone|ipad/i.test(ua)?"Mobile":"Desktop";
  const browser=/edg/i.test(ua)?"Edge":/chrome/i.test(ua)?"Chrome":/firefox/i.test(ua)?"Firefox":/safari/i.test(ua)?"Safari":"Other";
  data.views.push({
    id:nextId(data.views),
    page,device,browser,
    created_at:new Date().toISOString()
  });
  saveData(data);
  res.json({ok:true});
});

app.get("/api/public",(req,res)=>{
  const data=loadData();
  res.json({
    posts:data.posts.slice().sort((a,b)=>b.id-a.id).slice(0,50),
    projects:data.projects.slice().sort((a,b)=>b.id-a.id),
    games:data.games.slice().sort((a,b)=>b.id-a.id)
  });
});

app.get("/api/admin/stats",admin,(req,res)=>{
  const data=loadData();
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth(),d=now.getDate();
  const isToday=v=>{
    const x=new Date(v.created_at);
    return x.getFullYear()===y && x.getMonth()===m && x.getDate()===d;
  };
  const total=data.views.length;
  const today=data.views.filter(isToday).length;
  const mobile=data.views.filter(v=>v.device==="Mobile").length;
  const desktop=data.views.filter(v=>v.device==="Desktop").length;
  const counts={};
  data.views.forEach(v=>counts[v.page]=(counts[v.page]||0)+1);
  const pages=Object.entries(counts)
    .map(([page,n])=>({page,n}))
    .sort((a,b)=>b.n-a.n).slice(0,10);
  const recent=data.views.slice().sort((a,b)=>b.id-a.id).slice(0,20)
    .map(({page,device,browser,created_at})=>({page,device,browser,created_at}));
  res.json({total,today,mobile,desktop,pages,recent});
});

app.post("/api/admin/post",admin,upload.single("file"),(req,res)=>{
  const data=loadData();
  const file=req.file?"/uploads/"+req.file.filename:"";
  data.posts.push({
    id:nextId(data.posts),
    type:req.body.type||"text",
    title:req.body.title||"",
    body:req.body.body||"",
    file,
    created_at:new Date().toISOString()
  });
  saveData(data);
  res.json({ok:true});
});

app.post("/api/admin/project",admin,upload.single("image"),(req,res)=>{
  const data=loadData();
  const image=req.file?"/uploads/"+req.file.filename:"";
  data.projects.push({
    id:nextId(data.projects),
    name:req.body.name||"",
    description:req.body.description||"",
    tech:req.body.tech||"",
    link:req.body.link||"",
    code:req.body.code||"",
    image,
    created_at:new Date().toISOString()
  });
  saveData(data);
  res.json({ok:true});
});

app.post("/api/admin/game",admin,(req,res)=>{
  const data=loadData();
  data.games.push({
    id:nextId(data.games),
    name:req.body.name||"",
    description:req.body.description||"",
    url:req.body.url||"",
    created_at:new Date().toISOString()
  });
  saveData(data);
  res.json({ok:true});
});

app.delete("/api/admin/post/:id",admin,(req,res)=>{
  const data=loadData();
  data.posts=data.posts.filter(x=>String(x.id)!==String(req.params.id));
  saveData(data);
  res.json({ok:true});
});

app.delete("/api/admin/project/:id",admin,(req,res)=>{
  const data=loadData();
  data.projects=data.projects.filter(x=>String(x.id)!==String(req.params.id));
  saveData(data);
  res.json({ok:true});
});

app.delete("/api/admin/game/:id",admin,(req,res)=>{
  const data=loadData();
  data.games=data.games.filter(x=>String(x.id)!==String(req.params.id));
  saveData(data);
  res.json({ok:true});
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MATIN running on port ${PORT}`);
});
