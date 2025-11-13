// -------- Mock data (UI only) ----------
const allPrefs = ["Books","Drinks","Networking","Coding","Hiking","Movies","Board Games","Photography","Fitness","Volunteering"];
let userPrefs = ["Books","Food","Brainrot"]; // initial chips

function renderChips(){
  const wrap = document.getElementById('chips');
  if (!wrap) return;
  wrap.innerHTML = "";
  userPrefs.forEach(p => {
    const c = document.createElement('span');
    c.className = "chip";
    c.textContent = p;
    wrap.appendChild(c);
  });
  // Add (+)
  const add = document.createElement('span');
  add.className = "chip add";
  add.textContent = "+";
  add.title = "Edit preferences";
  add.onclick = openPrefModal;
  wrap.appendChild(add);
}

// Preferences modal
const prefModal = document.getElementById('prefModal');
const prefList  = document.getElementById('prefList');

function openPrefModal(){
  if (!prefList || !prefModal) return;
  // Build options with add/remove toggle
  prefList.innerHTML = "";
  allPrefs.forEach(name=>{
    const row = document.createElement('div');
    row.className = "pref-item";
    const label = document.createElement('div');
    label.className = "pref-name";
    label.textContent = name;

    const btn = document.createElement('button');
    btn.className = "btn toggle";
    const selected = userPrefs.includes(name);
    btn.textContent = selected ? "Remove —" : "Add +";
    btn.onclick = ()=>{
      const i = userPrefs.indexOf(name);
      if(i>-1){ userPrefs.splice(i,1); }
      else { userPrefs.push(name); }
      openPrefModal(); // re-render
    };

    row.append(label, btn);
    prefList.appendChild(row);
  });
  prefModal.classList.add('show');
  prefModal.setAttribute('aria-hidden',"false");
}

const closeBtn = document.getElementById('prefClose');
if (closeBtn) closeBtn.onclick = ()=>{
  prefModal?.classList.remove('show');
  prefModal?.setAttribute('aria-hidden',"true");
};
const applyBtn = document.getElementById('prefApply');
if (applyBtn) applyBtn.onclick = ()=>{
  prefModal?.classList.remove('show');
  renderChips();
};

// Bio inline edit
const bioEdit   = document.getElementById('bioEdit');
const bioView   = document.getElementById('bioView');
const bioText   = document.getElementById('bioText');
const bioBox    = document.getElementById('bioEditBox');
const bioTA     = document.getElementById('bioTextarea');
const bioSave   = document.getElementById('bioSave');
const bioCancel = document.getElementById('bioCancel');

if (bioEdit) {
  bioEdit.onclick = ()=>{
    if (!bioTA || !bioText || !bioView || !bioBox) return;
    bioTA.value = bioText.textContent.trim();
    bioView.style.display="none";
    bioBox.style.display="block";
  };
}
if (bioSave) {
  bioSave.onclick = (e)=>{
    e.preventDefault();
    if (!bioTA || !bioText || !bioView || !bioBox) return;
    bioText.textContent = bioTA.value.trim();
    bioView.style.display="block";
    bioBox.style.display="none";
  };
}
if (bioCancel) {
  bioCancel.onclick = (e)=>{
    e.preventDefault();
    if (!bioView || !bioBox) return;
    bioView.style.display="block";
    bioBox.style.display="none";
  };
}

// Edit picture (direct picker)
const avatar = document.getElementById('avatar');
const input  = document.getElementById('avatarInput');
const editPic = document.querySelector('.edit-pic');
if (editPic && input) {
  editPic.onclick = ()=> input.click();
}
if (input && avatar) {
  input.onchange = (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    avatar.src = url;
  };
}

// initial render
renderChips();
