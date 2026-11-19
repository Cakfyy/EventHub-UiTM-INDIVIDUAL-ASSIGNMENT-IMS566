// ===== js/crud.js =====
// Reusable Add / Edit / Delete modal.
// Used by events.js, participants.js and venues.js.
// cfg: { key, label, nameField, fields:[{name,label,type,options,list,min,req}], validate, onChange }
function crud(cfg) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="modal fade" id="fm" tabindex="-1"><div class="modal-dialog modal-lg modal-dialog-scrollable"><form class="modal-content" novalidate>
      <div class="modal-header"><h5 class="modal-title"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body"><div class="row g-3"></div></div>
      <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save ${cfg.label.toLowerCase()}</button></div></form></div></div>
    <div class="modal fade" id="dm" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content">
      <div class="modal-body p-4"><h5>Delete this ${cfg.label.toLowerCase()}?</h5><p class="mb-0 text-body-secondary" id="dtxt"></p></div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Keep it</button><button class="btn btn-danger" id="dyes">Delete</button></div></div></div></div>`;
  document.body.append(wrap);
  const form = wrap.querySelector('form'), body = form.querySelector('.row');
  const fm = new bootstrap.Modal(wrap.querySelector('#fm')), dm = new bootstrap.Modal(wrap.querySelector('#dm'));
  let editId = null, delId = null;

  // Build one form field
  const input = (f, v) => {
    const a = `name="${f.name}" id="f_${f.name}" class="form-${f.type === 'select' ? 'select' : 'control'}" ${f.req === false ? '' : 'required'}`;
    if (f.type === 'select') return `<select ${a}>${f.options().map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    if (f.type === 'textarea') return `<textarea ${a} rows="3">${esc(v)}</textarea>`;
    const dl = f.list ? `<datalist id="dl_${f.name}">${f.list().map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : '';
    return `<input type="${f.type}" ${a} value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.list ? `list="dl_${f.name}"` : ''}>${dl}`;
  };
  // Open the form modal
  function open(item) {
    form.classList.remove('was-validated');
    form.querySelector('.modal-title').textContent = (editId ? 'Edit ' : 'Add ') + cfg.label.toLowerCase();
    body.innerHTML = cfg.fields.map(f => `<div class="${f.type === 'textarea' ? 'col-12' : 'col-md-6'}"><label class="form-label fw-bold small" for="f_${f.name}">${f.label}</label>${input(f, item[f.name] ?? '')}<div class="invalid-feedback">Enter a valid ${f.label.toLowerCase()}.</div></div>`).join('');
    fm.show();
  }
  // Save when the form is submitted
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;
    const d = {};
    cfg.fields.forEach(f => { const v = form.elements[f.name].value.trim(); d[f.name] = f.type === 'number' ? Number(v) : v; });
    const old = editId ? DB.get(cfg.key).find(x => x.id === editId) : null;
    const err = cfg.validate && cfg.validate(d, old);
    if (err) return toast(err, 'danger');
    editId ? DB.update(cfg.key, editId, d) : DB.add(cfg.key, d);
    cfg.onSave && cfg.onSave(old, d);
    fm.hide();
    toast(`${cfg.label} ${editId ? 'updated' : 'added'}`);
    cfg.onChange();
  });
  wrap.querySelector('#dyes').onclick = () => { const old = DB.get(cfg.key).find(x => x.id === delId); DB.remove(cfg.key, delId); cfg.onRemove && cfg.onRemove(old); dm.hide(); toast(`${cfg.label} deleted`, 'danger'); cfg.onChange(); };
  // Functions used by the page buttons
  return {
    add() { editId = null; open({}); },
    edit(id) { editId = id; open(DB.get(cfg.key).find(x => x.id === id)); },
    del(id) { delId = id; wrap.querySelector('#dtxt').textContent = `"${DB.get(cfg.key).find(x => x.id === id)[cfg.nameField]}" will be removed. You can restore the sample data from Profile.`; dm.show(); }
  };
}
