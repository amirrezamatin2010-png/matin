let key="";
async function login(){key=document.querySelector("#key").value;const r=await fetch("/api/admin/stats",{headers:{"x-admin-key":key}});if(!r.ok)return alert("کلید اشتباه است");document.querySelector("#panel").hidden=false;refresh()}
async function refresh(){const r=await fetch("/api/admin/stats",{headers:{"x-admin-key":key}}),d=await r.json();document.querySelector("#stats").innerHTML=`<div class="card"><h3>کل بازدید</h3><h2>${d.total}</h2></div><div class="card"><h3>امروز</h3><h2>${d.today}</h2></div><div class="card"><h3>موبایل</h3><h2>${d.mobile}</h2></div><div class="card"><h3>دسکتاپ</h3><h2>${d.desktop}</h2></div>`;document.querySelector("#recent").innerHTML=d.recent.map(x=>`<p style="color:var(--muted)">• ${x.created_at} — ${x.page} — ${x.device} — ${x.browser}</p>`).join("")}
async function send(form,url,multipart){const fd=new FormData(form);const r=await fetch(url,{method:"POST",headers:{"x-admin-key":key},body:fd});if(!r.ok)alert("خطا");else{form.reset();refresh();alert("انجام شد")}}
postForm.onsubmit=e=>{e.preventDefault();send(e.target,"/api/admin/post",true)}
projectForm.onsubmit=e=>{e.preventDefault();send(e.target,"/api/admin/project",true)}
gameForm.onsubmit=e=>{e.preventDefault();send(e.target,"/api/admin/game",true)}
