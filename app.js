/* RockBuddy MVP — vanilla JS, localStorage, 2 pages */
const RockBuddy = (() => {
  const KEY = "rockbuddy_save_v1";

  const PERSONALITIES = [
    {
      id: "zen_master",
      label: "The Zen Master",
      desc: "Calm, philosophical, unreasonably patient.",
      styleClass: "smooth",
      miniClass: "",
      rockClass: "",
      traits: ["wise", "calm", "puns"],
    },
    {
      id: "dramatic_one",
      label: "The Dramatic One",
      desc: "Moody. Needs attention. Acts like a shattered poem.",
      styleClass: "crystal",
      miniClass: "crystal",
      rockClass: "crystal",
      traits: ["moody", "intense", "theatrical"],
    },
    {
      id: "rebel",
      label: "The Rebel",
      desc: "Sarcastic, anti-establishment, lowkey caring.",
      styleClass: "jagged",
      miniClass: "jagged",
      rockClass: "jagged",
      traits: ["sarcastic", "defiant", "unexpectedly_soft"],
    },
  ];

  const NAMES = [
    "Rocky Balstone","Pebble Kardashian","Dwayne (Not Johnson)","Stone Cold Steve Rockstin",
    "Granite Goggins","Sediment Tina","Sir Quartz-a-Lot","Boulder Swift","Chiseled Eilish",
    "Captain Igneous","Shale-ene Dion","Lorde of the Stones","Obsidian Kenobi","Slate Drake",
    "Moss Def","Rocky Raccoonbait","Professor Pebbles","Basalt Boy","Gneiss Guy","Clastopher"
  ];

  // Thought library: small but tagged. Add more later.
  const THOUGHTS = [
    // generic
    t("gen_01", "What if we’re all just someone else’s paperweights?", ["generic"], ["zen_master","dramatic_one","rebel"], ["contemplative"]),
    t("gen_02", "I used to take life for granite. Now I’m more sedimentary.", ["pun"], ["zen_master","rebel"], ["happy","bored","contemplative"]),
    t("gen_03", "If a tree falls and no one hears it… does it still need help?", ["generic"], ["zen_master","dramatic_one"], ["contemplative"]),
    t("gen_04", "Sometimes the strongest move is doing absolutely nothing. I’m built for this.", ["generic"], ["zen_master"], ["happy","contemplative"]),
    t("gen_05", "You ever feel like society is just… layers of dirt on a slightly anxious rock?", ["generic"], ["rebel"], ["bored","contemplative"]),
    t("gen_06", "I’m not saying I’m judging you. I’m saying I’m observing. Like a stone therapist.", ["generic"], ["zen_master","rebel"], ["happy","contemplative"]),
    t("gen_07", "My hobby is existing. It’s going okay.", ["generic"], ["dramatic_one","rebel"], ["bored"]),
    t("gen_08", "Some days I glow. Some days I’m emotionally matte.", ["generic"], ["dramatic_one"], ["bored","contemplative"]),

    // polish
    t("pol_01", "Ah, exfoliation. My pores thank you.", ["polish"], ["zen_master","dramatic_one","rebel"], ["happy","bored","contemplative"]),
    t("pol_02", "I’m shimmering. Please remain calm. Or don’t. That’s your thing.", ["polish"], ["rebel"], ["happy"]),
    t("pol_03", "Polished. Presentable. Ready to be ignored by the universe again.", ["polish"], ["dramatic_one"], ["happy","bored"]),

    // teach
    t("teach_01", "Knowledge is heavy. Fortunately, I am not.", ["teach"], ["zen_master","rebel"], ["happy","contemplative"]),
    t("teach_02", "I accept your teachings. I will misuse them later.", ["teach"], ["rebel"], ["happy","bored"]),
    t("teach_03", "This is either enlightenment… or a headache. Possibly both.", ["teach"], ["dramatic_one"], ["contemplative"]),

    // neglect milestones
    t("neg_6h_01", "I have waited. Like a rock. Because I am one.", ["neglect","6h"], ["zen_master","dramatic_one","rebel"], ["bored"]),
    t("neg_12h_01", "The dust bunnies asked about you. I lied.", ["neglect","12h"], ["rebel","dramatic_one"], ["bored"]),
    t("neg_24h_01", "I’ve been contemplating the void. It’s… voidy.", ["neglect","24h"], ["zen_master","dramatic_one","rebel"], ["contemplative"]),
    t("neg_48h_01", "I started a revolution with the dust bunnies. You missed the coup.", ["neglect","48h"], ["rebel"], ["bored"]),
    t("neg_72h_01", "I wrote a tragic opera about abandonment. It was silent, obviously.", ["neglect","72h"], ["dramatic_one"], ["bored","contemplative"]),

    // listen replies (generic templates)
    t("listen_01", "Have you considered your boss might be three raccoons in a trench coat?", ["listen"], ["rebel","dramatic_one","zen_master"], ["happy","bored","contemplative"]),
    t("listen_02", "Breathe. You’re a complicated human on a spinning rock. I’m a simpler rock. We balance.", ["listen"], ["zen_master"], ["contemplative"]),
    t("listen_03", "That sounds rough. Want my solution? Be a rock. No meetings. No emails. Only vibes.", ["listen"], ["rebel"], ["happy","bored"]),
    t("listen_04", "Your feelings are valid. Annoying sometimes. But valid.", ["listen"], ["dramatic_one"], ["contemplative"]),
  ];

  const ACHIEVEMENTS = [
    { id:"first_polish", name:"First Polish", check: s => s.history.polishCount >= 1 },
    { id:"rock_whisperer", name:"Rock Whisperer", check: s => s.history.totalInteractions >= 100 },
    { id:"existential_crisis", name:"Existential Crisis", check: s => s.history.deepThoughtCount >= 12 },
    { id:"neglectful_parent", name:"Neglectful Parent", check: s => s.stats.ignoredDays >= 7 },
    { id:"philo_student", name:"Philosophy Student", check: s => s.stats.philosophy >= 80 },
    { id:"clean_era", name:"Clean Era", check: s => s.stats.dustiness <= 5 && s.history.polishCount >= 5 },
  ];

  function t(id, text, tags, personalities, moods, weight=1){
    return { id, text, tags, personalities, moods, weight };
  }

  function nowISO(){ return new Date().toISOString(); }
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function hoursBetween(isoA, isoB){
    const a = new Date(isoA).getTime();
    const b = new Date(isoB).getTime();
    return (b-a) / (1000*60*60);
  }

  function prettyTime(iso){
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday:"short", hour:"2-digit", minute:"2-digit" });
  }

  function personalityById(id){
    return PERSONALITIES.find(p => p.id === id) || PERSONALITIES[0];
  }

  function defaultState({name, type}){
    const start = nowISO();
    return {
      version: 1,
      name,
      type,
      adoptedAt: start,
      lastInteraction: start,
      lastThoughtAt: start,
      stats: {
        contentment: 75,
        philosophy: 35,
        dustiness: 18,
        ignoredDays: 0,
      },
      mood: "contemplative",
      history: {
        totalInteractions: 0,
        polishCount: 0,
        teachCount: 0,
        listenCount: 0,
        ignoreCount: 0,
        deepThoughtCount: 0,
        recentThoughtIds: [],
        thoughtLog: [],
      },
      achievements: [],
      pendingEvents: {
        neg6h: false,
        neg12h: false,
        neg24h: false,
        neg48h: false,
        neg72h: false,
      }
    };
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(!parsed || parsed.version !== 1) return null;
      return parsed;
    }catch(e){ return null; }
  }

  function save(state){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset(){
    localStorage.removeItem(KEY);
  }

  function computeDaysTogether(state){
    const a = new Date(state.adoptedAt).getTime();
    const b = Date.now();
    const days = Math.floor((b-a)/(1000*60*60*24)) + 1;
    return clamp(days, 1, 9999);
  }

  function computeMood(state){
    const { contentment, philosophy, dustiness } = state.stats;
    const idleH = hoursBetween(state.lastInteraction, nowISO());

    // base mood score
    if(contentment >= 75 && dustiness <= 25) return "happy";
    if(philosophy >= 60 && contentment >= 45) return "contemplative";
    if(idleH >= 10 || contentment < 50) return "bored";
    return "contemplative";
  }

  function applyTimeDecay(state){
    const now = nowISO();
    const idleH = Math.max(0, hoursBetween(state.lastInteraction, now));

    // decay rules (tweakable)
    const dustGain = idleH * 1.1;            // dust per hour
    const contentDecay = idleH * 0.6;        // contentment per hour
    const philoDecay = idleH * 0.06;         // very slow

    state.stats.dustiness = clamp(state.stats.dustiness + dustGain, 0, 100);
    state.stats.contentment = clamp(state.stats.contentment - contentDecay, 0, 100);
    state.stats.philosophy = clamp(state.stats.philosophy - philoDecay, 0, 100);

    // ignoredDays updates
    const daysIgnored = Math.floor(idleH / 24);
    state.stats.ignoredDays = clamp(daysIgnored, 0, 365);

    // trigger neglect events once
    triggerNeglectEvents(state, idleH);

    // mood
    state.mood = computeMood(state);
  }

  function triggerNeglectEvents(state, idleH){
    const flags = state.pendingEvents;
    const fire = (key, tagH) => {
      if(flags[key]) return;
      flags[key] = true;
      const tag = `${tagH}h`;
      const thought = pickThought(state, ["neglect", tag], true);
      if(thought) addThoughtToLog(state, thought.text, `Neglect ${tag}`);
    };

    if(idleH >= 6) fire("neg6h", 6);
    if(idleH >= 12) fire("neg12h", 12);
    if(idleH >= 24) fire("neg24h", 24);
    if(idleH >= 48) fire("neg48h", 48);
    if(idleH >= 72) fire("neg72h", 72);
  }

  function addThoughtToLog(state, text, source="Rock"){
    const entry = { at: nowISO(), text, source };
    state.history.thoughtLog.unshift(entry);
    state.history.thoughtLog = state.history.thoughtLog.slice(0, 8);
    state.history.deepThoughtCount += 1;
  }

  function recentGuard(state, id){
    const q = state.history.recentThoughtIds;
    if(q.includes(id)) return false;
    q.unshift(id);
    state.history.recentThoughtIds = q.slice(0, 12);
    return true;
  }

  function pickThought(state, requiredTags=[], allowRepeat=false){
    const p = state.type;
    const mood = state.mood;

    const pool = THOUGHTS.filter(th => {
      const okP = th.personalities.includes(p);
      const okM = th.moods.includes(mood) || th.moods.includes("happy") || th.moods.includes("bored") || th.moods.includes("contemplative");
      const okT = requiredTags.every(tag => th.tags.includes(tag));
      return okP && okM && okT;
    });

    if(pool.length === 0) return null;

    // weighted pick + avoid repeats
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for(const th of shuffled){
      if(allowRepeat) return th;
      if(recentGuard(state, th.id)) return th;
    }
    return rand(pool);
  }

  function runAchievements(state){
    const got = new Set(state.achievements);
    for(const a of ACHIEVEMENTS){
      if(!got.has(a.id) && a.check(state)){
        state.achievements.push(a.id);
        addThoughtToLog(state, `Achievement unlocked: ${a.name}. Try not to peak here.`, "System");
      }
    }
  }

  function incInteraction(state, kind){
    state.history.totalInteractions += 1;
    if(kind === "polish") state.history.polishCount += 1;
    if(kind === "teach") state.history.teachCount += 1;
    if(kind === "listen") state.history.listenCount += 1;
    if(kind === "ignore") state.history.ignoreCount += 1;
    state.lastInteraction = nowISO();
    state.mood = computeMood(state);
  }

  function personalityDisplay(id){
    const p = personalityById(id);
    if(p.id === "zen_master") return "Zen Master";
    if(p.id === "dramatic_one") return "Dramatic One";
    return "Rebel";
  }

  /* Adoption page */
  function initAdoptionPage(){
    const list = document.getElementById("rockList");
    const nameInput = document.getElementById("rockName");
    const genBtn = document.getElementById("genName");
    const adoptBtn = document.getElementById("adopt");

    let selected = PERSONALITIES[0].id;

    // render cards
    list.innerHTML = "";
    PERSONALITIES.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = "rock-option" + (idx===0 ? " selected":"");
      div.dataset.id = p.id;

      const mini = document.createElement("div");
      mini.className = "mini-rock " + (p.miniClass || "");
      div.appendChild(mini);

      const h3 = document.createElement("h3");
      h3.textContent = p.label;
      div.appendChild(h3);

      const d = document.createElement("p");
      d.textContent = p.desc;
      div.appendChild(d);

      div.addEventListener("click", () => {
        selected = p.id;
        document.querySelectorAll(".rock-option").forEach(x => x.classList.remove("selected"));
        div.classList.add("selected");
      });

      list.appendChild(div);
    });

    function generateName(){
      const n = rand(NAMES);
      nameInput.value = n;
      nameInput.focus();
    }

    genBtn.addEventListener("click", generateName);
    document.addEventListener("keydown", (e) => {
      if(e.key.toLowerCase() === "g") generateName();
    });

    adoptBtn.addEventListener("click", () => {
      const name = (nameInput.value || "").trim() || rand(NAMES);
      const state = defaultState({ name, type: selected });
      save(state);
      window.location.href = "home.html";
    });

    // if already saved, prefill
    const existing = load();
    if(existing){
      nameInput.value = existing.name || "";
      selected = existing.type || selected;
      // mark selected
      document.querySelectorAll(".rock-option").forEach(x => {
        x.classList.toggle("selected", x.dataset.id === selected);
      });
    }
  }

  /* Home page */
  function initHomePage(){
    const state = load();
    if(!state){
      window.location.href = "index.html";
      return;
    }

    // apply decay on load
    applyTimeDecay(state);
    runAchievements(state);
    save(state);

    // dom
    const rockEl = document.getElementById("rock");
    const rockTitle = document.getElementById("rockTitle");
    const subtitle = document.getElementById("subtitle");

    const pillPersonality = document.getElementById("pillPersonality");
    const pillMood = document.getElementById("pillMood");
    const pillDays = document.getElementById("pillDays");

    const bubble = document.getElementById("bubble");
    const bubbleText = document.getElementById("bubbleText");
    const bubbleWho = document.getElementById("bubbleWho");

    const toast = document.getElementById("toast");

    const sContent = document.getElementById("sContent");
    const sPhilo = document.getElementById("sPhilo");
    const sDust = document.getElementById("sDust");
    const sIgnored = document.getElementById("sIgnored");
    const sLast = document.getElementById("sLast");

    const bContent = document.getElementById("bContent");
    const bPhilo = document.getElementById("bPhilo");
    const bDust = document.getElementById("bDust");

    const achList = document.getElementById("achList");
    const thoughtLog = document.getElementById("thoughtLog");

    const btnPolish = document.getElementById("btnPolish");
    const btnListen = document.getElementById("btnListen");
    const btnTeach = document.getElementById("btnTeach");
    const btnIgnore = document.getElementById("btnIgnore");
    const resetBtn = document.getElementById("reset");

    const modalListen = document.getElementById("modalListen");
    const listenInput = document.getElementById("listenInput");
    const listenSend = document.getElementById("listenSend");
    const listenReply = document.getElementById("listenReply");

    const modalTeach = document.getElementById("modalTeach");
    const teachRead = document.getElementById("teachRead");
    const teachReply = document.getElementById("teachReply");
    const teachProgress = document.getElementById("teachProgress");

    function showToast(msg="Saved."){
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(()=>toast.classList.remove("show"), 1300);
    }

    function setBubble(text, who="Rock"){
      bubbleWho.textContent = who;
      bubbleText.textContent = text;
      bubble.classList.add("show");
      clearTimeout(setBubble._t);
      setBubble._t = setTimeout(()=> bubble.classList.remove("show"), 4200);
    }

    function render(){
      rockTitle.textContent = `${state.name}’s Home`;
      subtitle.textContent = `Mood: ${capitalize(state.mood)} • Type: ${personalityDisplay(state.type)}`;

      const p = personalityById(state.type);
      rockEl.className = `rock wiggle ${p.rockClass || ""} mood-${state.mood}`;

      pillPersonality.textContent = `Personality: ${personalityDisplay(state.type)}`;
      pillMood.textContent = `Mood: ${capitalize(state.mood)}`;
      pillDays.textContent = `Days Together: ${computeDaysTogether(state)}`;

      // stats
      sContent.textContent = `${Math.round(state.stats.contentment)}/100`;
      sPhilo.textContent = `${Math.round(state.stats.philosophy)}/100`;
      sDust.textContent = `${Math.round(state.stats.dustiness)}/100`;
      sIgnored.textContent = `${state.stats.ignoredDays}`;
      sLast.textContent = prettyTime(state.lastInteraction);

      bContent.style.width = `${clamp(state.stats.contentment,0,100)}%`;
      bPhilo.style.width = `${clamp(state.stats.philosophy,0,100)}%`;
      bDust.style.width = `${clamp(state.stats.dustiness,0,100)}%`;

      // achievements
      if(state.achievements.length === 0){
        achList.textContent = "No achievements yet. Try interacting instead of staring.";
      } else {
        const names = state.achievements.map(id => (ACHIEVEMENTS.find(a=>a.id===id)?.name || id));
        achList.innerHTML = names.map(n => `• ${escapeHtml(n)}`).join("<br>");
      }

      // thought log
      if(state.history.thoughtLog.length === 0){
        thoughtLog.textContent = "No thoughts logged yet. Your rock is waiting.";
      } else {
        thoughtLog.innerHTML = state.history.thoughtLog
          .map(e => `• <span style="color:rgba(255,255,255,.85)">${escapeHtml(e.text)}</span> <span style="color:rgba(154,167,178,.75)">(${escapeHtml(e.source)})</span>`)
          .join("<br>");
      }

      // teach progress is basically philosophy %
      teachProgress.textContent = `Enlightenment: ${Math.round(state.stats.philosophy)}%`;
    }

    function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

    function escapeHtml(str){
      return String(str)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    function tickThoughtIfNeeded(){
      const now = nowISO();
      const h = hoursBetween(state.lastThoughtAt, now);
      // every 5 minutes = 0.0833h
      if(h >= (5/60)){
        const th = pickThought(state, ["generic"], false) || pickThought(state, [], false);
        if(th){
          state.lastThoughtAt = now;
          addThoughtToLog(state, th.text, "Thought");
          runAchievements(state);
          save(state);
          setBubble(th.text, state.name);
          render();
        }
      }
    }

    // random thought check every 20s (cheap)
    setInterval(tickThoughtIfNeeded, 20000);

    // also show an opening thought
    setTimeout(() => {
      const th = pickThought(state, ["generic"], false) || pickThought(state, [], false);
      if(th){
        setBubble(th.text, state.name);
      }
    }, 650);

    /* Interactions */
    // Polish: drag on rock increases polish progress, reduces dust, boosts contentment
    let polishing = false;
    let polishProgress = 0;
    let lastSpark = 0;

    function sparkle(x,y){
      const s = document.createElement("div");
      s.className = "sparkle";
      const dx = (Math.random()*60 - 30).toFixed(1) + "px";
      const dy = (Math.random()*60 - 30).toFixed(1) + "px";
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--dx", dx);
      s.style.setProperty("--dy", dy);
      document.querySelector(".stage").appendChild(s);
      setTimeout(()=>s.remove(), 800);
    }

    function startPolish(){
      setBubble("Polish me then. Drag on my glorious surface.", state.name);
      polishProgress = 0;
    }

    btnPolish.addEventListener("click", startPolish);

    function onPointerDown(e){
      // only polish if near rock
      const rect = rockEl.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if(!inside) return;
      polishing = true;
      rockEl.setPointerCapture?.(e.pointerId);
    }
    function onPointerMove(e){
      if(!polishing) return;
      polishProgress += 1;

      // sparkles throttled
      const now = Date.now();
      if(now - lastSpark > 35){
        lastSpark = now;
        const stageRect = document.querySelector(".stage").getBoundingClientRect();
        sparkle(e.clientX - stageRect.left, e.clientY - stageRect.top);
      }

      if(polishProgress >= 80){
        polishing = false;
        doPolishComplete();
      }
    }
    function onPointerUp(){
      polishing = false;
    }

    rockEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    function doPolishComplete(){
      incInteraction(state, "polish");
      state.stats.dustiness = clamp(state.stats.dustiness - 22, 0, 100);
      state.stats.contentment = clamp(state.stats.contentment + 12, 0, 100);

      const th = pickThought(state, ["polish"], false) || pickThought(state, [], false);
      if(th) setBubble(th.text, state.name);

      addThoughtToLog(state, "Polished to a socially acceptable shine.", "Action");
      runAchievements(state);
      save(state);
      showToast("Polished + saved.");
      render();
    }

    // Listen
    btnListen.addEventListener("click", () => {
      openModal("modalListen");
      listenReply.style.display = "none";
      listenReply.textContent = "";
      listenInput.value = "";
      listenInput.focus();
    });

    listenSend.addEventListener("click", () => {
      const msg = (listenInput.value || "").trim();
      if(!msg){
        listenReply.style.display = "block";
        listenReply.textContent = "Type something. I’m a rock, not a mind reader.";
        return;
      }

      incInteraction(state, "listen");
      state.stats.contentment = clamp(state.stats.contentment + 8, 0, 100);
      state.stats.philosophy = clamp(state.stats.philosophy + 3, 0, 100);

      const reply = buildListenReply(state, msg);
      listenReply.style.display = "block";
      listenReply.textContent = reply;

      addThoughtToLog(state, `You vented. Rock responded: “${reply}”`, "Listen");
      runAchievements(state);
      save(state);
      showToast("Vented + saved.");
      render();
      setBubble(reply, state.name);
    });

    function buildListenReply(state, userText){
      // pick a base line
      const base = pickThought(state, ["listen"], true)?.text || "That’s tough. Want to be a rock about it?";
      // tiny personalization without pretending to understand
      const spice = state.type === "rebel"
        ? " Also… break one rule (legally). As a treat."
        : state.type === "dramatic_one"
          ? " And yes, you’re allowed to be dramatic. Life is dramatic."
          : " Slow down. One thing at a time.";
      // If user includes obvious stress words, switch to calmer addon
      const stressy = /(anx|panic|stress|overwhelm|depress|sad|cry|fail|exam|school|work)/i.test(userText);
      return stressy ? base : (base + spice);
    }

    // Teach
    btnTeach.addEventListener("click", () => {
      openModal("modalTeach");
      teachReply.style.display = "none";
      teachReply.textContent = "";
      updateTeachProgress();
    });

    function updateTeachProgress(){
      teachProgress.textContent = `Enlightenment: ${Math.round(state.stats.philosophy)}%`;
    }

    teachRead.addEventListener("click", () => {
      incInteraction(state, "teach");
      state.stats.philosophy = clamp(state.stats.philosophy + 7, 0, 100);
      state.stats.contentment = clamp(state.stats.contentment + 4, 0, 100);

      const th = pickThought(state, ["teach"], false) || pickThought(state, [], false);
      const reply = th ? th.text : "I have absorbed your words. They are… words.";
      teachReply.style.display = "block";
      teachReply.textContent = reply;

      addThoughtToLog(state, "Philosophy session completed. Nobody knows what it means.", "Teach");
      runAchievements(state);
      save(state);
      showToast("Taught + saved.");
      render();
      updateTeachProgress();
      setBubble(reply, state.name);

      // tiny unlock behavior
      if(state.stats.philosophy >= 80){
        addThoughtToLog(state, "Your rock is dangerously close to enlightenment. Or burnout.", "System");
      }
    });

    // Ignore
    btnIgnore.addEventListener("click", () => {
      incInteraction(state, "ignore");
      state.stats.contentment = clamp(state.stats.contentment - 10, 0, 100);

      const line = state.type === "rebel"
        ? "Finally. Some peace. I’m going to unionize with the lint."
        : state.type === "dramatic_one"
          ? "You ignore me? Me?? Iconic betrayal."
          : "Ignoring is a form of meditation. For you. Not for me.";
      addThoughtToLog(state, "You pressed Ignore. That says a lot.", "Action");

      runAchievements(state);
      save(state);
      showToast("Ignored + saved.");
      render();
      setBubble(line, state.name);
    });

    // reset
    resetBtn.addEventListener("click", () => {
      reset();
      window.location.href = "index.html";
    });

    // modal controls
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });

    function openModal(id){
      document.getElementById(id).classList.add("show");
    }
    function closeModal(id){
      document.getElementById(id).classList.remove("show");
    }

    // close modal on backdrop click
    [modalListen, modalTeach].forEach(m => {
      m.addEventListener("click", (e) => {
        if(e.target === m) m.classList.remove("show");
      });
    });

    // render first
    render();
  }

  return {
    initAdoptionPage,
    initHomePage,
    load,
    save,
    reset,
  };
})();
