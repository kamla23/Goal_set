const KEY = "simpleToDoList";

const inp = document.getElementById("task");
const addBtn = document.getElementById("add");
const list = document.getElementById("tasklist");
const msg = document.getElementById("message");
const clrAllBtn = document.getElementById("clearAll");
const clrBtn = document.getElementById("clear");
const box = document.getElementById("confirmation");
const okBtn = document.getElementById("confirm");
const noBtn = document.getElementById("cancel");
const count = document.getElementById("taskcounter");
const tabs = document.getElementById("filter");

let flt = "all";

const get = () => {
  try {
    const d = localStorage.getItem(KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
};

const save = (t) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {}
};

const paint = () => {
  const all = get();
  let f = [];

  if (flt === "active") f = all.filter((t) => !t.completed);
  else if (flt === "completed") f = all.filter((t) => t.completed);
  else f = all;

  if (flt === "all") f.sort((a, b) => a.completed - b.completed);

  list.innerHTML = "";

  const has = all.length > 0;
  const hasDone = all.some((t) => t.completed);
  const active = all.filter((t) => !t.completed).length;

  count.textContent = `${active} Remaining work`;

  if (has) {
    msg.classList.add("hidden");
    clrAllBtn.classList.remove("hidden");
  } else {
    msg.classList.remove("hidden");
    clrAllBtn.classList.add("hidden");
  }

  clrBtn.classList.toggle("hidden", !hasDone);

  if (f.length === 0 && has) {
    list.innerHTML = `<li class="p-4 text-center text-gray-500">This filter is out of commission. Replace the filter.</li>`;
    return;
  }

  f.forEach((t) => list.appendChild(makeItem(t)));
};

const makeItem = (t) => {
  const li = document.createElement("li");
  li.className = `todo-item flex items-center justify-between p-4 hover:bg-gray-50 ${
    t.completed ? "completed" : ""
  }`;
  li.dataset.id = t.id;

  const left = document.createElement("div");
  left.className = "flex items-center flex-grow min-w-0";

  const tog = document.createElement("span");
  tog.className = `toggle-icon w-5 h-5 mr-3 rounded-full border-2 flex-shrink-0 cursor-pointer ${
    t.completed
      ? "bg-indigo-500 border-indigo-500 text-white flex items-center justify-center"
      : "border-gray-400"
  }`;

  if (t.completed) {
    tog.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.704 4.032a1 1 0 01-.353 1.096l-6 12a1 1 0 01-1.707 0l-6-12a1 1 0 01.353-1.096 1 1 0 011.096-.353l5.5 11 5.5-11a1 1 0 011.096.353z"/>
                        </svg>`;
  }

  const txt = document.createElement("span");
  txt.className = "task-text text-lg text-gray-800 break-words select-none";
  txt.textContent = t.text;

  left.appendChild(tog);
  left.appendChild(txt);

  const right = document.createElement("div");
  right.className = "flex items-center space-x-2 ml-4 flex-shrink-0";

  const edit = document.createElement("button");
  edit.className = `edit-btn text-indigo-500 hover:text-indigo-700 p-1 rounded-full ${
    t.completed ? "invisible" : ""
  }`;
  edit.dataset.a = "edit";
  edit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z"/>
                      </svg>`;

  const del = document.createElement("button");
  del.className = "delete-btn text-red-500 hover:text-red-700 p-1 rounded-full";
  del.dataset.a = "del";
  del.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"/>
                      </svg>`;

  right.appendChild(edit);
  right.appendChild(del);

  li.appendChild(left);
  li.appendChild(right);

  return li;
};

const start = (txt, id) => {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.value = txt.textContent;
  inp.className =
    "edit-input flex-grow p-1 border border-indigo-400 rounded-md focus:ring-indigo-500 text-lg";

  txt.parentNode.replaceChild(inp, txt);
  inp.focus();

  inp.addEventListener("blur", () => saveEdit(id, inp.value.trim()));
  inp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") inp.blur();
  });
};

const saveEdit = (id, v) => {
  let t = get();

  if (v === "") {
    t = t.filter((x) => x.id !== id);
  } else {
    const x = t.find((x) => x.id === id);
    if (x) x.text = v;
  }

  save(t);
  paint();
};

const add = () => {
  const v = inp.value.trim();
  if (!v) return;

  const n = { id: Date.now(), text: v, completed: false };

  const t = get();
  t.push(n);
  save(t);

  if (flt === "completed") flt = "all";

  paint();
  inp.value = "";
};

const listClick = (e) => {
  const li = e.target.closest(".todo-item");
  if (!li) return;

  const id = parseInt(li.dataset.id);
  let t = get();

  const b = e.target.closest("button");
  if (b) {
    const a = b.dataset.a;

    if (a === "del") {
      save(t.filter((x) => x.id !== id));
      paint();
      return;
    }

    if (a === "edit") {
      const txt = li.querySelector(".task-text");
      start(txt, id);
      return;
    }
  }

  const x = t.find((x) => x.id === id);
  x.completed = !x.completed;
  save(t);
  paint();
};

const setFilter = (f) => {
  flt = f;
  updateTabs();
  paint();
};

const updateTabs = () => {
  document.querySelectorAll(".filter-btn").forEach((b) => {
    if (b.dataset.filter === flt)
      b.classList.add("bg-indigo-500", "text-white", "border-indigo-500");
    else b.classList.remove("bg-indigo-500", "text-white", "border-indigo-500");
  });
};

const showBox = () => box.classList.remove("hidden");
const hideBox = () => box.classList.add("hidden");

const clrAll = () => {
  save([]);
  hideBox();
  paint();
};

const clrDone = () => {
  const t = get().filter((x) => !x.completed);
  save(t);

  if (flt === "completed") flt = "all";

  paint();
  updateTabs();
};

const init = () => {
  paint();
  updateTabs();

  addBtn.addEventListener("click", add);
  inp.addEventListener("keypress", (e) => e.key === "Enter" && add());

  list.addEventListener("click", listClick);
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".filter-btn");
    if (b) setFilter(b.dataset.filter);
  });

  clrBtn.addEventListener("click", clrDone);
  clrAllBtn.addEventListener("click", showBox);

  okBtn.addEventListener("click", clrAll);
  noBtn.addEventListener("click", hideBox);

  box.addEventListener("click", (e) => {
    if (e.target === box) hideBox();
  });
};

init();
