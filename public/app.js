async function load(){
 const r=await fetch("/api/public"); const d=await r.json();
 const posts=document.querySelector("#posts");
 posts.innerHTML=d.posts.length?d.posts.map(p=>`
 <article class="card"><small>${escapeHtml(p.type.toUpperCase())}</small>
 <h3>${escapeHtml(p.title||"پست MATIN")}</h3><p>${escapeHtml(p.body||"")}</p>
 ${media(p)}</article>`).join(""):`<div class="empty">هنوز پستی منتشر نشده. از پنل مدیریت اولین پست را بساز.</div>`;
 const pg=document.querySelector("#projectsGrid");
 pg.innerHTML=d.projects.length?d.projects.map(p=>`<article class="card">
 ${p.image?`<img class="media" src="${p.image}" alt="">`:""}<h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p>
 <div class="tags">${escapeHtml(p.tech)}</div>${p.link?`<p><a class="btn" target="_blank" href="${p.link}">مشاهده / اجرا</a></p>`:""}</article>`).join(""):`<div class="empty">پروژه‌ای اضافه نشده.</div>`;
 const gg=document.querySelector("#gamesGrid");
 gg.innerHTML=d.games.length?d.games.map(g=>`<article class="card"><h3>🎮 ${escapeHtml(g.name)}</h3><p>${escapeHtml(g.description)}</p><a class="btn primary" target="_blank" href="${g.url}">▶ اجرای بازی</a></article>`).join(""):`<div class="empty">بازی‌ای اضافه نشده.</div>`;
 document.querySelector("#year").textContent=new Date().getFullYear();
 fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page:location.pathname})});
}
function media(p){if(!p.file)return"";if(p.type==="video")return`<video class="media" controls src="${p.file}"></video>`;if(p.type==="audio")return`<audio class="media" controls src="${p.file}"></audio>`;if(p.type==="image")return`<img class="media" src="${p.file}" alt="">`;return""}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
load();

// Account / permission UX. Production OTP must be connected to an SMS provider.
const loginBtn=document.querySelector("#loginBtn"), account=document.querySelector("#account");
const loggedOut=document.querySelector("#accountLoggedOut"), loggedIn=document.querySelector("#accountLoggedIn");
const phoneEl=document.querySelector("#phone"), otpEl=document.querySelector("#otp"), otpRow=document.querySelector("#otpRow"), otpNote=document.querySelector("#otpNote");
let demoOtp=null, currentPhone=localStorage.getItem("matin_phone");
function showAccount(){account.scrollIntoView({behavior:"smooth"});}
loginBtn?.addEventListener("click",showAccount);
function renderAccount(){
 if(currentPhone){loggedOut.hidden=true;loggedIn.hidden=false;document.querySelector("#accountPhone").textContent=currentPhone;loginBtn.textContent="حساب من";}
 else {loggedOut.hidden=false;loggedIn.hidden=true;loginBtn.textContent="ورود / ثبت‌نام";}
}
document.querySelector("#sendOtp")?.addEventListener("click",()=>{
 const p=phoneEl.value.trim();
 if(!/^\+?\d{10,15}$/.test(p.replace(/\s/g,""))) return alert("شماره موبایل را درست وارد کن.");
 demoOtp=String(Math.floor(100000+Math.random()*900000));
 otpRow.hidden=false;
 otpNote.textContent="نسخه آزمایشی: سرویس SMS هنوز وصل نشده است. برای تست کد نمایش‌داده‌شده در کنسول مرورگر را ببین.";
 console.log("MATIN DEMO OTP:",demoOtp);
});
document.querySelector("#verifyOtp")?.addEventListener("click",()=>{
 if(otpEl.value!==demoOtp) return alert("کد تأیید صحیح نیست.");
 currentPhone=phoneEl.value.trim(); localStorage.setItem("matin_phone",currentPhone); renderAccount();
});
document.querySelector("#logoutBtn")?.addEventListener("click",()=>{localStorage.removeItem("matin_phone");currentPhone=null;renderAccount();});
document.querySelector("#galleryBtn")?.addEventListener("click",()=>document.querySelector("#galleryInput").click());
document.querySelector("#cameraBtn")?.addEventListener("click",()=>document.querySelector("#cameraInput").click());
document.querySelector("#galleryInput")?.addEventListener("change",e=>alert(`${e.target.files.length} فایل توسط خودت انتخاب شد.`));
document.querySelector("#cameraInput")?.addEventListener("change",e=>alert(e.target.files.length?"عکس انتخاب شد.":"لغو شد."));
document.querySelector("#micBtn")?.addEventListener("click",async()=>{
 try{
   const s=await navigator.mediaDevices.getUserMedia({audio:true});
   s.getTracks().forEach(t=>t.stop()); alert("اجازه میکروفون داده شد. ضبط واقعی را می‌توان به آپلود/پست متصل کرد.");
 }catch(e){alert("اجازه میکروفون داده نشد یا مرورگر از آن پشتیبانی نمی‌کند.");}
});
document.querySelector("#contactsBtn")?.addEventListener("click",async()=>{
 if("contacts" in navigator && "ContactsManager" in window){
   try{
     const contacts=await navigator.contacts.select(["name","tel"],{multiple:false});
     alert(contacts.length?"یک مخاطب توسط خودت انتخاب شد.":"انتخابی انجام نشد.");
   }catch(e){alert("انتخاب مخاطب لغو شد.");}
 }else{
   alert("این مرورگر Contact Picker را پشتیبانی نمی‌کند. سایت به دفترچه تلفن دسترسی مستقیم ندارد.");
 }
});
renderAccount();
