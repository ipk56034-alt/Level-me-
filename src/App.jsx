import React, { useState } from "react";

/* Level Me v5
   起動 → 主人公を選ぶ → 3つの質問 → ロードマップ生成 → 使い方 → アプリ本編
   レベルの上がり方を最初に明示し、以降もヘルプからいつでも読み直せる */

const C = {
  violet: "#7C5CE0",
  violetSoft: "#EFEAFF",
  ink: "#2B2545",
  sub: "#7A749A",
  gold: "#F0A93B",
  mint: "#3FBFA3",
  pink: "#F2698F",
  blue: "#4DA3E8",
  card: "#FFFFFF",
  line: "#E6E2F5",
};
const DOT = [C.violet, C.blue, C.mint, C.gold];
const font =
  "'Hiragino Maru Gothic ProN','Hiragino Sans','Yu Gothic',system-ui,sans-serif";

/* ───────── 主人公 ───────── */
const HAIRS = ["ショート", "ロング", "ツイン", "くるくる"];
const HAIR_COLORS = ["#3B3B4A", "#5B4033", "#8A5A2B", "#C98A3E", "#7C5CE0", "#D96A8E"];
const SKINS = ["#F6D9C4", "#EBC0A0", "#C99A72", "#8D6247"];
const CLOTHES = ["#8FA5D8", "#F2A0B8", "#8ED2BE", "#F5C86B", "#B79CE8", "#7FC4E8"];
const NAME_IDEAS = ["そら", "ひなた", "つむぎ", "あお", "みなと", "ゆい"];
const DEFAULT_LOOK = { hair: 0, hairColor: 0, skin: 0, cloth: 0 };

/* ───────── オンボーディングの質問 ───────── */
const QUESTIONS = [
  {
    key: "goal",
    type: "text",
    q: "3ヶ月後、どうなっていたら\nうれしい？",
    hint: "うまく書けなくて大丈夫。思いついたままで。",
    placeholder: "例：やりたいことを人に説明できるようになっていたい",
    chips: [
      "自分の強みを言葉にできている",
      "新しい活動を始めている",
      "出願で語れる材料がある",
      "一緒にやる仲間ができている",
      "行動できる自分になっている",
    ],
  },
  {
    key: "interest",
    type: "multi",
    q: "気になっていることは？",
    hint: "いくつでも。あとから変えられます",
    options: [
      "教育・こども",
      "環境・気候",
      "まちづくり・地域",
      "国際・多文化",
      "平和・人権",
      "ジェンダー",
      "福祉・介護",
      "医療・健康",
      "貧困・格差",
      "食・農業",
      "防災",
      "動物",
      "表現・アート",
      "音楽",
      "スポーツ",
      "デザイン",
      "テクノロジー",
      "起業・ビジネス",
      "science・研究",
      "ことば・文章",
      "政治・ルールづくり",
      "まだわからない",
    ],
  },
  {
    key: "activity",
    type: "single",
    q: "いまの活動量に\nいちばん近いのは？",
    hint: "正直でだいじょうぶ",
    options: [
      "まだ何もしていない",
      "部活や勉強だけ",
      "ひとつ活動している",
      "いくつも掛け持ちしている",
    ],
  },
];

const GUIDE = [
  {
    tag: "ジャーナリング",
    title: "3つの問いに答えるだけ",
    body: "AIが順番に質問します。うまく書こうとしなくて大丈夫。話し言葉のままで3分あれば終わります。",
  },
  {
    tag: "マイコンパス",
    title: "書いた分だけ、道ができる",
    body: "記録するたび山道に1歩ぶん置かれます。あなたの行動から読み取れた価値観も、ここに集まっていきます。",
  },
  {
    tag: "見つける",
    title: "次にやることが見つかる",
    body: "たまった記録から、あなたに合いそうな活動の方向とキーワードが出ます。書くほど精度が上がります。",
  },
  {
    tag: "レベル",
    title: "上がる瞬間は2つだけ",
    body: "①記録を1回書く → 経験値+1　②ロードマップのステップを達成する → 経験値+3。経験値3ごとにレベルが1つ上がります。",
  },
];

/* ───────── AIへの指示 ───────── */
const ROADMAP_SYSTEM = `あなたは日本の10代の伴走者です。以下の回答から、その人だけの3ステップのロードマップを作ります。

守ること：
- 「あなたは何者か」を問い返さない。負担になるため。
- ステップは、今週から手をつけられる大きさにする。壮大にしない。
- 実在する団体名・イベント名は書かない。
- 説教しない。ほめない。

次のJSONだけを出力。前置き・コードフェンス禁止。

{"goal":"目指す状態を旗に書く言葉。12文字以内",
"why":"なぜこの道のりを提案したかを60〜80文字。回答の言葉を拾う",
"steps":[{"title":"ステップ名。10文字以内","detail":"具体的に何をするか。30文字以内"}]}

stepsはちょうど3件。1件目はいちばん軽いものにする。`;

const OPENER = "最近やった活動で、いちばん記憶に残っている場面は？";
const FALLBACK = [
  "その場面で、あなたが実際にやった行動は？",
  "他のやり方もあったのに、なぜそれを選んだ？",
];

const ASK_SYSTEM = `あなたは日本の高校生・大学生が、自分の活動を自分の言葉で語れるようにするインタビュアーです。

最重要ルール：抽象度を上げず、下げる。
「気持ち」や「意味」を先に聞かない。まず具体的な行動、次にその判断の理由、最後にその人でなければ起きなかったことへ進む。

出力ルール：
- 質問を1つだけ。45文字以内。
- 前置き・共感・評価・ほめ言葉は書かない。質問文のみ。
- やさしい話し言葉。相手は10代。
- 相手の答えの中の固有の言葉を必ず1つ拾って使う。`;

const SUM_SYSTEM = `以下は、ある10代の若者が自分の活動について答えた記録です。
次のJSONだけを出力。前置き・コードフェンス禁止。

{"title":"この経験につける短い名前。活動の内容そのもの。10文字以内",
"caption":"その経験を一言で。15文字以内。ほめ言葉にしない",
"values":["実際にとった行動から読み取れる価値観を2〜3語。抽象名詞1語ずつ"],
"insight":"本人が使った具体的な言葉を引用しながら、この人がどんな判断をする人かを70〜100文字で。断定せず『〜かもしれない』で終える。ほめない。",
"nextAction":"この記録から自然につながる、来週できそうな具体的な行動を1つ。30文字以内。壮大にしない。"}`;

const REPORT_SYSTEM = `以下は、ある10代の若者の複数回分の振り返り記録です。
次のJSONだけを出力。前置き・コードフェンス禁止。

{"thread":"複数の記録に共通して現れる行動パターンを100〜150文字で。具体的な記述を根拠として挙げる。",
"line":"『私は〜する人間です』という形の一文を1つ。誇張しない。",
"challenge":"次に挑戦するとよさそうなことを1つ、40文字以内"}`;

const FIND_SYSTEM = `以下は、ある10代の若者の振り返り記録です。この人に合いそうな課外活動・ボランティアの方向性を提案してください。

絶対に守ること：
- 実在する団体名・イベント名・プログラム名は書かない。存在しない団体を作ってしまうため。
- 提案するのは「活動のジャンル」と「探すためのキーワード」まで。
- 本人の記録にある具体的な言葉を根拠として必ず引用する。

次のJSONだけを出力。前置き・コードフェンス禁止。

{"suggestions":[{"type":"活動のジャンル。15文字以内","why":"記録のどの部分から、なぜこの人に合うと思ったかを60〜90文字。本人の言葉を引用する","keywords":["検索に使える語を2〜3個"],"firstStep":"最初の一歩。30文字以内"}]}

suggestionsは3件。1件は記録から素直につながるもの、1件は少しだけずらしたものにする。`;

async function callClaude(system, userText) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, userText }),
  });
  if (!res.ok) throw new Error("api error");
  const data = await res.json();
  return data.content
    .map((i) => (i.type === "text" ? i.text : ""))
    .filter(Boolean)
    .join("\n");
}
const parseJSON = (t) => JSON.parse(t.replace(/```json|```/g, "").trim());

const REC_STOPS = [
  { x: 180, y: 470 },
  { x: 156, y: 414 },
  { x: 200, y: 358 },
  { x: 162, y: 304 },
];
const STEP_STOPS = [
  { x: 200, y: 248 },
  { x: 168, y: 196 },
  { x: 184, y: 146 },
];

export default function LevelMe() {
  /* オンボーディング */
  const [phase, setPhase] = useState("welcome"); // welcome/create/q/making/roadmap/guide/app
  const [name, setName] = useState("");
  const [look, setLook] = useState(DEFAULT_LOOK);
  const [dress, setDress] = useState(false);
  const [draft, setDraft] = useState("");
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState({ interest: [] });
  const [guideIdx, setGuideIdx] = useState(0);
  const [roadmap, setRoadmap] = useState(null);
  const [done, setDone] = useState([false, false, false]);

  /* 本編 */
  const [tab, setTab] = useState("home");
  const [entries, setEntries] = useState([]);
  const [session, setSession] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [report, setReport] = useState(null);
  const [finds, setFinds] = useState(null);
  const [showValues, setShowValues] = useState(false);
  const [help, setHelp] = useState(false);
  const [error, setError] = useState("");

  const xp = entries.length + done.filter(Boolean).length * 3;
  const level = Math.floor(xp / 3) + 1;
  const toNext = 3 - (xp % 3);
  const nextAction = entries[0]?.nextAction;

  const counts = {};
  entries.forEach((e) =>
    (e.values || []).forEach((v) => (counts[v] = (counts[v] || 0) + 1))
  );
  const values = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const climb = [...entries].reverse().slice(-REC_STOPS.length);

  const transcriptOf = (turns) =>
    turns
      .map((t) => (t.role === "q" ? `問い：${t.text}` : `答え：${t.text}`))
      .join("\n");
  const allRecords = () =>
    entries
      .map((e, i) => `【${entries.length - i}／${e.date}】\n${e.transcript}`)
      .join("\n\n");

  async function makeRoadmap(finalAns) {
    setPhase("making");
    const text = QUESTIONS.map(
      (q) =>
        `${q.q.replace("\n", "")} → ${
          Array.isArray(finalAns[q.key])
            ? finalAns[q.key].join("、") || "（未選択）"
            : finalAns[q.key] || "（未記入）"
        }`
    ).join("\n");
    try {
      setRoadmap(parseJSON(await callClaude(ROADMAP_SYSTEM, text)));
    } catch (e) {
      setRoadmap({
        goal: "自分の言葉を持つ",
        why: "まずは書くことから始めます。",
        steps: [
          { title: "1回書く", detail: "最近の活動をひとつ記録する" },
          { title: "続けて書く", detail: "3日以内にもう1回書く" },
          { title: "外に出る", detail: "気になる活動をひとつ調べる" },
        ],
      });
    }
    setPhase("roadmap");
  }

  function start() {
    setSession([{ role: "q", text: OPENER }]);
    setInput("");
    setResult(null);
    setError("");
    setTab("journal");
  }

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...session, { role: "a", text }];
    const count = next.filter((t) => t.role === "a").length;
    setSession(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      if (count < 3) {
        const hint =
          count === 1
            ? "次は『実際にとった行動』を具体的に聞いてください。"
            : "次は『なぜそれを選んだのか』『その人がやったことで何が変わったのか』を聞いてください。";
        const q = await callClaude(ASK_SYSTEM + "\n\n" + hint, transcriptOf(next));
        setSession([...next, { role: "q", text: q.trim() }]);
      } else {
        const parsed = parseJSON(await callClaude(SUM_SYSTEM, transcriptOf(next)));
        const entry = {
          id: Date.now(),
          date: new Date().toLocaleDateString("ja-JP", {
            month: "numeric",
            day: "numeric",
          }),
          transcript: transcriptOf(next),
          ...parsed,
        };
        setEntries([entry, ...entries]);
        setResult(entry);
        setSession(null);
        setReport(null);
        setFinds(null);
      }
    } catch (e) {
      if (count < 3) {
        setSession([...next, { role: "q", text: FALLBACK[Math.min(count - 1, 1)] }]);
      } else {
        setError("まとめを作れませんでした。もう一度送ってみてください。");
        setSession(session);
      }
    }
    setLoading(false);
  }

  async function makeReport() {
    setLoading(true);
    setError("");
    try {
      setReport(parseJSON(await callClaude(REPORT_SYSTEM, allRecords())));
    } catch (e) {
      setError("レポートを作れませんでした。");
    }
    setLoading(false);
  }
  async function makeFinds() {
    setLoading(true);
    setError("");
    try {
      const r = parseJSON(await callClaude(FIND_SYSTEM, allRecords()));
      setFinds(r.suggestions || []);
    } catch (e) {
      setError("提案を作れませんでした。");
    }
    setLoading(false);
  }

  const heroName = name.trim() || "あなた";
  const Q = QUESTIONS[qi];

  function nextQ(val) {
    const na = { ...ans, [Q.key]: val };
    setAns(na);
    setDraft("");
    if (qi + 1 < QUESTIONS.length) setQi(qi + 1);
    else makeRoadmap(na);
  }
  function toggleInterest(o) {
    const cur = ans.interest || [];
    setAns({
      ...ans,
      interest: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o],
    });
  }

  /* ═══════════ オンボーディング ═══════════ */
  if (phase !== "app") {
    return (
      <div style={shell}>
        <Anim />
        <div style={{ ...frame, padding: "0 22px", display: "flex", alignItems: "center", minHeight: "100vh" }}>
          <div style={{ width: "100%" }}>
            {phase === "welcome" && (
              <div className="rise" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.sub, letterSpacing: ".2em" }}>
                  LEVEL ME
                </div>
                <h1 style={{ fontSize: 27, lineHeight: 1.6, margin: "14px 0 10px" }}>
                  あなたの毎日を、
                  <br />
                  ひとつの冒険にする
                </h1>
                <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 2 }}>
                  やってきたことを書きとめると、
                  <br />
                  道になって、次の一歩が見えてきます。
                </p>
                <div style={{ margin: "24px 0" }}>
                  <Hero look={look} size={92} />
                </div>
                <button onClick={() => setPhase("create")} style={btn}>
                  はじめる
                </button>
                <p style={{ fontSize: 11, color: C.sub, marginTop: 14, lineHeight: 1.8 }}>
                  質問は3つだけ。1分で終わります。
                </p>
              </div>
            )}

            {phase === "create" && (
              <div className="rise">
                <Step n={1} of={3} />
                <h2 style={h2}>主人公をつくろう</h2>
                <p style={lead}>この道を歩くのは、あなたです。</p>

                <Creator
                  look={look}
                  setLook={setLook}
                  name={name}
                  setName={setName}
                />

                <button
                  onClick={() => setPhase("q")}
                  disabled={!name.trim()}
                  style={{ ...btn, opacity: name.trim() ? 1 : 0.45 }}
                >
                  {name.trim() ? `${name.trim()}で進む` : "名前をつけてください"}
                </button>
              </div>
            )}

            {phase === "q" && (
              <div className="rise" key={qi}>
                <Step n={2} of={3} />
                <h2 style={{ ...h2, whiteSpace: "pre-line" }}>{Q.q}</h2>
                <p style={lead}>{Q.hint}</p>

                {Q.type === "text" && (
                  <>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      placeholder={Q.placeholder}
                      style={{ ...ta, marginTop: 18 }}
                    />
                    <div style={{ ...chipWrap, marginTop: 10 }}>
                      {Q.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => setDraft(draft.trim() ? `${draft.trim()}、${c}` : c)}
                          style={hintChip}
                        >
                          ＋ {c}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => nextQ(draft.trim())}
                      disabled={!draft.trim()}
                      style={{ ...btn, opacity: draft.trim() ? 1 : 0.45 }}
                    >
                      つぎへ
                    </button>
                    <button onClick={() => nextQ("まだわからない")} style={ghost(false)}>
                      まだわからない
                    </button>
                  </>
                )}

                {Q.type === "multi" && (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                      {Q.options.map((o) => {
                        const on = (ans.interest || []).includes(o);
                        return (
                          <button
                            key={o}
                            onClick={() => toggleInterest(o)}
                            style={{
                              ...tagBtn,
                              background: on ? C.violet : C.card,
                              color: on ? "#fff" : C.ink,
                              borderColor: on ? C.violet : C.line,
                            }}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => nextQ(ans.interest)}
                      disabled={!(ans.interest || []).length}
                      style={{ ...btn, opacity: (ans.interest || []).length ? 1 : 0.45 }}
                    >
                      つぎへ（{(ans.interest || []).length}）
                    </button>
                  </>
                )}

                {Q.type === "single" && (
                  <div style={{ marginTop: 20 }}>
                    {Q.options.map((o) => (
                      <button key={o} onClick={() => nextQ(o)} style={choice}>
                        {o}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: "center", fontSize: 11, color: C.sub, marginTop: 14 }}>
                  {qi + 1} / {QUESTIONS.length}
                </div>
              </div>
            )}

            {phase === "making" && (
              <div style={{ textAlign: "center" }}>
                <div className="float">
                  <Hero look={look} size={80} />
                </div>
                <p style={{ fontSize: 15, marginTop: 20, color: C.sub }}>
                  あなたの道のりを考えています…
                </p>
              </div>
            )}

            {phase === "roadmap" && roadmap && (
              <div className="rise">
                <Step n={3} of={3} />
                <h2 style={h2}>これが、いまの地図</h2>
                <p style={lead}>{roadmap.why}</p>

                <div style={{ ...panel, marginTop: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.sub }}>目指すところ</div>
                  <div style={{ fontSize: 19, fontWeight: 700, marginTop: 6 }}>
                    🚩 {roadmap.goal}
                  </div>
                </div>

                {roadmap.steps.map((s, i) => (
                  <div key={i} style={{ ...panel, display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: DOT[i],
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.7 }}>
                        {s.detail}
                      </div>
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.9, marginTop: 6 }}>
                  この地図は仮のものです。書いていくうちに、あなたに合う形へ書き換わっていきます。
                </p>
                <button onClick={() => setPhase("guide")} style={btn}>
                  使い方を見る
                </button>
              </div>
            )}

            {phase === "guide" && (
              <div className="rise" key={guideIdx}>
                <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
                  {GUIDE.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 9,
                        background: i <= guideIdx ? C.violet : C.line,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.violet, fontWeight: 700 }}>
                  {GUIDE[guideIdx].tag}
                </div>
                <h2 style={{ ...h2, marginTop: 8 }}>{GUIDE[guideIdx].title}</h2>
                <p style={{ fontSize: 14.5, color: C.sub, lineHeight: 2.1, marginTop: 12 }}>
                  {GUIDE[guideIdx].body}
                </p>
                <button
                  onClick={() =>
                    guideIdx + 1 < GUIDE.length
                      ? setGuideIdx(guideIdx + 1)
                      : setPhase("app")
                  }
                  style={btn}
                >
                  {guideIdx + 1 < GUIDE.length ? "つぎへ" : "はじめる"}
                </button>
                {guideIdx + 1 < GUIDE.length && (
                  <button onClick={() => setPhase("app")} style={ghost(false)}>
                    とばす
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ 本編 ═══════════ */
  return (
    <div style={shell}>
      <Anim />
      <div style={frame}>
        {/* ホーム */}
        {tab === "home" && (
          <div style={{ padding: "22px 18px 0" }}>
            <TabHead
              title={`${heroName}の冒険`}
              sub="小さな一歩を、未来につなげる"
              onHelp={() => setHelp(true)}
            />

            <div style={{ ...panel, marginTop: 16, display: "flex", gap: 14, alignItems: "center" }}>
              <button
                onClick={() => setDress(true)}
                aria-label="きせかえ"
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
              >
                <Hero look={look} size={54} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.sub }}>
                  Lv.{level}　次のレベルまであと{toNext}
                </div>
                <div style={{ ...barBg, marginTop: 6 }}>
                  <div style={{ ...barFill, width: `${((xp % 3) / 3) * 100}%` }} />
                </div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 5 }}>
                  記録 {entries.length}　ステップ達成 {done.filter(Boolean).length}
                </div>
              </div>
            </div>

            {roadmap && (
              <div style={{ ...panel }}>
                <div style={label}>いまの目標</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>🚩 {roadmap.goal}</div>
                {roadmap.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setDone(done.map((d, j) => (j === i ? !d : d)))}
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      borderTop: `1px solid ${C.line}`,
                      padding: "12px 0",
                      cursor: "pointer",
                      fontFamily: font,
                      textAlign: "left",
                      marginTop: i === 0 ? 12 : 0,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${done[i] ? C.mint : C.line}`,
                        background: done[i] ? C.mint : "transparent",
                        color: "#fff",
                        fontSize: 12,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {done[i] ? "✓" : ""}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: done[i] ? C.sub : C.ink,
                          textDecoration: done[i] ? "line-through" : "none",
                        }}
                      >
                        {s.title}
                      </span>
                      <span style={{ display: "block", fontSize: 11.5, color: C.sub, marginTop: 2 }}>
                        {s.detail}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: C.violet, fontWeight: 700 }}>+3</span>
                  </button>
                ))}
              </div>
            )}

            {nextAction && (
              <div className="rise" style={violetPanel}>
                <div style={{ fontSize: 11, opacity: 0.85 }}>次の一歩</div>
                <div style={{ fontSize: 15.5, marginTop: 5, lineHeight: 1.6 }}>{nextAction}</div>
              </div>
            )}

            <button onClick={start} style={btn}>
              ジャーナリングする　<span style={{ opacity: 0.8, fontSize: 12 }}>+1</span>
            </button>
          </div>
        )}

        {/* マイコンパス */}
        {tab === "compass" && (
          <div>
            <div style={{ padding: "20px 18px 8px" }}>
              <TabHead
                title="マイコンパス"
                sub="あなたの経験が、未来の自分をつくっていく"
                onHelp={() => setHelp(true)}
                right={
                  <button onClick={() => setShowValues(!showValues)} style={pill}>
                    価値観コンパス
                  </button>
                }
              />
            </div>

            {showValues && (
              <div className="rise" style={{ padding: "0 18px" }}>
                <div style={panel}>
                  {values.length === 0 ? (
                    <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.9 }}>
                      記録すると、行動から読み取れた価値観がここに集まります。
                    </p>
                  ) : (
                    <>
                      <div style={{ ...label, marginBottom: 10 }}>これまでに出てきた回数</div>
                      {values.map(([v, n]) => (
                        <div key={v} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span>{v}</span>
                            <span style={{ color: C.violet, fontWeight: 700 }}>{n}回</span>
                          </div>
                          <div style={barBg}>
                            <div style={{ ...barFill, width: `${(n / values[0][1]) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            <div style={{ position: "relative", width: "100%", maxWidth: 360, margin: "0 auto" }}>
              <Mountain climb={climb} roadmap={roadmap} done={done} look={look} />

              {roadmap && (
                <div
                  style={{
                    position: "absolute",
                    top: "6%",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  {roadmap.goal}
                </div>
              )}

              {climb.map((e, i) => {
                const s = REC_STOPS[i];
                const left = s.x < 180;
                return (
                  <div
                    key={e.id}
                    className="rise"
                    style={{
                      position: "absolute",
                      top: `${((s.y - 30) / 540) * 100}%`,
                      ...(left ? { left: 6 } : { right: 6 }),
                      width: "43%",
                      background: "rgba(255,255,255,.94)",
                      borderRadius: 14,
                      padding: "9px 11px",
                      boxShadow: "0 5px 16px rgba(90,70,160,.14)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: DOT[i % DOT.length],
                          color: "#fff",
                          fontSize: 10.5,
                          fontWeight: 700,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>
                        {e.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.sub, marginTop: 5, lineHeight: 1.5 }}>
                      {e.caption}
                    </div>
                  </div>
                );
              })}

              {entries.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "14%",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 12.5,
                    color: C.sub,
                    lineHeight: 2,
                  }}
                >
                  まだ道は始まっていない。
                  <br />
                  1回書くと、1歩目が置かれます。
                </div>
              )}
            </div>

            <div style={{ padding: "6px 18px 0" }}>
              <div style={panel}>
                <div style={{ ...label, marginBottom: 6 }}>今日のひとこと</div>
                <p style={{ fontSize: 14, lineHeight: 1.9, margin: 0 }}>
                  {nextAction
                    ? `「${nextAction}」`
                    : "「まず1回書いてみる。それだけで1歩目になる」"}
                </p>
              </div>

              {report ? (
                <>
                  <div style={label}>{entries.length}件の記録から</div>
                  <p className="rise" style={{ fontSize: 14.5, lineHeight: 2, margin: "0 0 12px" }}>
                    {report.thread}
                  </p>
                  <div style={{ ...panel, borderLeft: `4px solid ${C.gold}` }}>
                    <div style={{ fontSize: 11, color: C.sub }}>いまのあなたを一文にすると</div>
                    <p style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.8, margin: "6px 0 0" }}>
                      {report.line}
                    </p>
                  </div>
                  <div style={violetPanel}>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>次に挑戦できそうなこと</div>
                    <div style={{ fontSize: 15, marginTop: 5, lineHeight: 1.6 }}>
                      {report.challenge}
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={makeReport}
                  disabled={entries.length < 3 || loading}
                  style={ghost(entries.length < 3)}
                >
                  {loading
                    ? "読み返しています…"
                    : entries.length < 3
                    ? `これまでをまとめて見る（あと${3 - entries.length}回）`
                    : "これまでをまとめて見る"}
                </button>
              )}
              {error && <p style={errStyle}>{error}</p>}
            </div>
          </div>
        )}

        {/* ジャーナリング */}
        {tab === "journal" && (
          <div style={{ padding: "22px 18px 0" }}>
            <TabHead
              title="ジャーナリング"
              sub="3つの問いに答えるだけ・3分"
              onHelp={() => setHelp(true)}
            />

            {session && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>
                  {session.filter((t) => t.role === "a").length} / 3
                </div>
                {session.map((t, i) =>
                  t.role === "q" ? (
                    <p key={i} className="rise" style={question}>
                      {t.text}
                    </p>
                  ) : (
                    <p key={i} style={bubble}>
                      {t.text}
                    </p>
                  )
                )}
                {loading && <p style={{ fontSize: 13, color: C.violet }}>考えています…</p>}
                {!loading && session[session.length - 1].role === "q" && (
                  <>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={5}
                      placeholder="思い出したまま、話し言葉で。"
                      style={ta}
                    />
                    <button
                      onClick={submit}
                      disabled={!input.trim()}
                      style={{ ...btn, opacity: input.trim() ? 1 : 0.45 }}
                    >
                      {session.filter((t) => t.role === "a").length >= 2 ? "書き終える" : "送る"}
                    </button>
                  </>
                )}
                {error && <p style={errStyle}>{error}</p>}
                <button onClick={() => setSession(null)} style={ghost(false)}>
                  やめる
                </button>
              </div>
            )}

            {!session && result && (
              <div style={{ marginTop: 26, textAlign: "center" }}>
                <div className="pop" style={badge}>
                  +1
                </div>
                <div style={{ fontWeight: 700, marginTop: 12, fontSize: 16 }}>
                  「{result.title}」が道に加わった
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
                  Lv.{level}　次のレベルまであと{toNext}
                </div>
                <div className="rise" style={{ ...panel, textAlign: "left", marginTop: 16 }}>
                  <p style={{ fontSize: 15, lineHeight: 1.95, margin: 0 }}>{result.insight}</p>
                  <div style={chipWrap}>
                    {(result.values || []).map((v) => (
                      <span key={v} style={chip}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rise" style={violetPanel}>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>次の一歩</div>
                  <div style={{ fontSize: 15, marginTop: 5, lineHeight: 1.6 }}>
                    {result.nextAction}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    setTab("compass");
                  }}
                  style={btn}
                >
                  道を見に行く
                </button>
              </div>
            )}

            {!session && !result && (
              <div style={{ marginTop: 20 }}>
                <button onClick={start} style={btn}>
                  今日の記録をはじめる
                </button>
                {entries.length === 0 ? (
                  <p style={empty}>
                    うまく書こうとしなくて大丈夫。
                    <br />
                    話し言葉のままでいけます。
                  </p>
                ) : (
                  <div style={{ marginTop: 22 }}>
                    <div style={label}>これまでの記録</div>
                    {entries.map((e) => (
                      <div key={e.id} style={panel}>
                        <div style={{ fontSize: 11, color: C.sub }}>{e.date}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>
                          {e.title}
                        </div>
                        <p style={{ fontSize: 13.5, lineHeight: 1.9, margin: "6px 0 10px" }}>
                          {e.insight}
                        </p>
                        <div style={chipWrap}>
                          {(e.values || []).map((v) => (
                            <span key={v} style={chip}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 見つける */}
        {tab === "find" && (
          <div style={{ padding: "22px 18px 0" }}>
            <TabHead
              title="見つける"
              sub="あなたの記録から、次の活動を探す"
              onHelp={() => setHelp(true)}
            />
            {entries.length === 0 ? (
              <p style={empty}>
                まず1回記録すると、
                <br />
                あなたに合う活動の方向が出せます。
              </p>
            ) : (
              <div style={{ marginTop: 20 }}>
                {!finds && (
                  <button onClick={makeFinds} disabled={loading} style={btn}>
                    {loading ? "探しています…" : "いまの自分に合う方向を見る"}
                  </button>
                )}
                {finds &&
                  finds.map((s, i) => (
                    <div key={i} className="rise" style={panel}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{s.type}</div>
                      <p style={{ fontSize: 13.5, lineHeight: 1.9, color: C.sub, margin: "8px 0 12px" }}>
                        {s.why}
                      </p>
                      <div style={chipWrap}>
                        {(s.keywords || []).map((k) => (
                          <span key={k} style={{ ...chip, background: "#EAF7F4", color: C.mint }}>
                            {k}
                          </span>
                        ))}
                      </div>
                      <div style={softPanel}>
                        <div style={{ fontSize: 11, color: C.violet, fontWeight: 700 }}>
                          最初の一歩
                        </div>
                        <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6 }}>
                          {s.firstStep}
                        </div>
                      </div>
                    </div>
                  ))}
                {finds && (
                  <>
                    <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.8 }}>
                      具体的な団体名は出していません。キーワードで自分で探して、申し込む前に必ず主催者を確認してください。
                    </p>
                    <button onClick={makeFinds} style={ghost(false)}>
                      もう一度考えてもらう
                    </button>
                  </>
                )}
                {error && <p style={errStyle}>{error}</p>}
              </div>
            )}
          </div>
        )}

        <div style={{ height: 96 }} />

        {/* きせかえ */}
        {dress && (
          <div style={sheetBg} onClick={() => setDress(false)}>
            <div className="rise" style={sheet} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>きせかえ</div>
              <Creator look={look} setLook={setLook} name={name} setName={setName} />
              <button onClick={() => setDress(false)} style={btn}>
                これでいく
              </button>
            </div>
          </div>
        )}

        {/* ヘルプ */}
        {help && (
          <div style={sheetBg} onClick={() => setHelp(false)}>
            <div className="rise" style={sheet} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
                このアプリの使い方
              </div>
              {GUIDE.map((g) => (
                <div key={g.tag} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11.5, color: C.violet, fontWeight: 700 }}>
                    {g.tag}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>
                    {g.title}
                  </div>
                  <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.9, margin: "4px 0 0" }}>
                    {g.body}
                  </p>
                </div>
              ))}
              <button onClick={() => setHelp(false)} style={btn}>
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* タブバー */}
        <div style={tabWrap}>
          <div style={tabBar}>
            {[
              ["home", "ホーム", HomeIcon],
              ["compass", "マイコンパス", CompassIcon],
              ["journal", "ジャーナリング", PenIcon],
              ["find", "見つける", SearchIcon],
            ].map(([k, lbl, Icon]) => (
              <button key={k} onClick={() => setTab(k)} style={tabBtn}>
                <Icon color={tab === k ? C.violet : "#B4AEC9"} active={tab === k} />
                <span
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    color: tab === k ? C.violet : "#B4AEC9",
                    fontWeight: tab === k ? 700 : 400,
                  }}
                >
                  {lbl}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── パーツ ───────── */
function Anim() {
  return (
    <style>{`
      @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      .rise{animation:rise .5s ease both}
      .pop{animation:pop .55s cubic-bezier(.2,1.4,.4,1) both}
      .float{animation:float 4s ease-in-out infinite}
      @media (prefers-reduced-motion: reduce){.rise,.pop,.float{animation:none}}
    `}</style>
  );
}

function Step({ n, of }) {
  return (
    <div style={{ fontSize: 11, color: C.violet, fontWeight: 700, letterSpacing: ".08em" }}>
      STEP {n} / {of}
    </div>
  );
}

function TabHead({ title, sub, onHelp, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: C.sub, marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {right}
        <button onClick={onHelp} aria-label="使い方" style={helpBtn}>
          ?
        </button>
      </div>
    </div>
  );
}

function HeroBody({ look, bg = true }) {
  const hairColor = HAIR_COLORS[look.hairColor];
  const skin = SKINS[look.skin];
  const cloth = CLOTHES[look.cloth];
  return (
    <>
      {bg && <circle cx="30" cy="30" r="29" fill="#FFFFFF" opacity=".7" />}

      {/* 後ろ髪 */}
      {look.hair === 1 && (
        <path d="M17,24 C17,42 20,46 20,46 L40,46 C40,46 43,42 43,24 Z" fill={hairColor} />
      )}
      {look.hair === 3 && <circle cx="30" cy="23" r="14" fill={hairColor} />}

      <circle cx="30" cy="24" r="10" fill={skin} />

      {/* 前髪 */}
      {look.hair === 0 && (
        <path d="M20,22 C20,12 40,12 40,22 C36,18 24,18 20,22 Z" fill={hairColor} />
      )}
      {look.hair === 1 && (
        <path d="M20,23 C20,12 40,12 40,23 C37,17 33,16 30,20 C27,16 23,17 20,23 Z" fill={hairColor} />
      )}
      {look.hair === 2 && (
        <>
          <path d="M20,22 C20,12 40,12 40,22 C36,17 24,17 20,22 Z" fill={hairColor} />
          <ellipse cx="16" cy="28" rx="5" ry="8" fill={hairColor} />
          <ellipse cx="44" cy="28" rx="5" ry="8" fill={hairColor} />
        </>
      )}
      {look.hair === 3 && (
        <path d="M20,21 C22,14 38,14 40,21 C36,18 24,18 20,21 Z" fill={hairColor} opacity=".9" />
      )}

      <path d="M16,50 C16,38 44,38 44,50 Z" fill={cloth} />
      <circle cx="26" cy="25" r="1.5" fill="#3B3B4A" />
      <circle cx="34" cy="25" r="1.5" fill="#3B3B4A" />
      <path d="M27,30 Q30,32 33,30" stroke="#3B3B4A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  );
}

function Hero({ look = DEFAULT_LOOK, size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <HeroBody look={look} />
    </svg>
  );
}

function Creator({ look, setLook, name, setName }) {
  const set = (k, v) => setLook({ ...look, [k]: v });
  return (
    <div>
      <div style={{ ...panel, textAlign: "center", marginTop: 20, paddingTop: 22 }}>
        <Hero look={look} size={110} />
        <button
          onClick={() =>
            setLook({
              hair: Math.floor(Math.random() * HAIRS.length),
              hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
              skin: Math.floor(Math.random() * SKINS.length),
              cloth: Math.floor(Math.random() * CLOTHES.length),
            })
          }
          style={{ ...pill, marginTop: 6 }}
        >
          🎲 おまかせ
        </button>
      </div>

      <div style={{ ...panel }}>
        <div style={label}>なまえ</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 10))}
          placeholder="すきな名前をどうぞ"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#FAF9FF",
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: "13px 14px",
            fontSize: 16,
            fontFamily: font,
            color: C.ink,
          }}
        />
        <div style={{ ...chipWrap, marginTop: 10 }}>
          {NAME_IDEAS.map((n) => (
            <button key={n} onClick={() => setName(n)} style={hintChip}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div style={panel}>
        <div style={label}>かみがた</div>
        <div style={{ display: "flex", gap: 8 }}>
          {HAIRS.map((h, i) => (
            <button
              key={h}
              onClick={() => set("hair", i)}
              style={{
                flex: 1,
                padding: "9px 2px",
                borderRadius: 12,
                border: `2px solid ${look.hair === i ? C.violet : C.line}`,
                background: look.hair === i ? C.violetSoft : C.card,
                fontSize: 11.5,
                fontFamily: font,
                color: C.ink,
                cursor: "pointer",
              }}
            >
              {h}
            </button>
          ))}
        </div>

        <div style={{ ...label, marginTop: 16 }}>かみの色</div>
        <Swatches list={HAIR_COLORS} value={look.hairColor} onPick={(i) => set("hairColor", i)} />

        <div style={{ ...label, marginTop: 16 }}>はだの色</div>
        <Swatches list={SKINS} value={look.skin} onPick={(i) => set("skin", i)} />

        <div style={{ ...label, marginTop: 16 }}>ふくの色</div>
        <Swatches list={CLOTHES} value={look.cloth} onPick={(i) => set("cloth", i)} />
      </div>
    </div>
  );
}

function Swatches({ list, value, onPick }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {list.map((c, i) => (
        <button
          key={c}
          onClick={() => onPick(i)}
          aria-label={`色 ${i + 1}`}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: c,
            border: value === i ? `3px solid ${C.ink}` : `2px solid #fff`,
            boxShadow: "0 2px 8px rgba(90,70,160,.18)",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}

function Mountain({ climb, roadmap, done, look }) {
  return (
    <svg viewBox="0 0 360 540" style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9E4FF" />
          <stop offset="55%" stopColor="#F3EEFB" />
          <stop offset="100%" stopColor="#FBF4EC" />
        </linearGradient>
        <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBFAFF" />
          <stop offset="100%" stopColor="#CFC7EC" />
        </linearGradient>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2DDF7" />
          <stop offset="100%" stopColor="#D3CDEE" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#FFF3D6" stopOpacity=".95" />
          <stop offset="100%" stopColor="#FFF3D6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="360" height="540" fill="url(#sky)" />
      <circle cx="180" cy="105" r="105" fill="url(#glow)" />
      <path d="M0,300 L70,205 L135,300 Z" fill="url(#far)" opacity=".7" />
      <path d="M225,300 L295,195 L360,300 Z" fill="url(#far)" opacity=".7" />
      <path d="M180,88 C205,150 250,290 300,500 L60,500 C110,290 155,150 180,88 Z" fill="url(#rock)" />
      <path d="M104,400 C130,392 150,412 176,404 C205,395 225,415 256,406 L272,500 L88,500 Z" fill="#C9E7C4" opacity=".85" />
      <path d="M126,318 C146,312 158,328 178,322 C200,315 216,330 238,324 L248,368 L116,368 Z" fill="#D5EBCE" opacity=".7" />

      <path
        d="M180,498 C150,470 205,448 180,420 C152,392 208,368 182,340 C155,312 210,286 180,258 C152,232 202,208 178,180 C162,160 180,130 180,100"
        fill="none"
        stroke="#F5E9D2"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M180,498 C150,470 205,448 180,420 C152,392 208,368 182,340 C155,312 210,286 180,258 C152,232 202,208 178,180 C162,160 180,130 180,100"
        fill="none"
        stroke="#fff"
        strokeWidth="13"
        strokeLinecap="round"
        strokeDasharray="2 12"
        opacity=".8"
      />

      {/* 旗＝目標 */}
      <g className="float">
        <line x1="180" y1="58" x2="180" y2="96" stroke="#B9AFD4" strokeWidth="3" />
        <path d="M180,58 L208,69 L180,80 Z" fill="#F2698F" />
      </g>

      {/* ロードマップのステップ（これから） */}
      {roadmap &&
        roadmap.steps.map((s, i) => {
          const p = STEP_STOPS[i];
          return (
            <g key={`s${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="13"
                fill={done[i] ? DOT[i] : "#FFFFFF"}
                stroke={done[i] ? DOT[i] : "#C9C2E6"}
                strokeWidth="2"
                strokeDasharray={done[i] ? "0" : "3 3"}
              />
              {done[i] && (
                <path
                  d={`M${p.x - 5},${p.y} l3.5,4 l6.5,-7`}
                  stroke="#fff"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              <text
                x={p.x + (p.x < 180 ? -20 : 20)}
                y={p.y + 4}
                textAnchor={p.x < 180 ? "end" : "start"}
                style={{ fontSize: 11, fill: C.sub, fontFamily: font }}
              >
                {s.title}
              </text>
            </g>
          );
        })}

      {/* 記録（これまで） */}
      {REC_STOPS.map((s, i) => {
        const on = i < climb.length;
        return (
          <g key={`r${i}`} opacity={on ? 1 : 0.3}>
            <ellipse cx={s.x} cy={s.y + 5} rx="21" ry="7" fill="#000" opacity=".07" />
            <ellipse cx={s.x} cy={s.y} rx="21" ry="7.5" fill={on ? DOT[i % DOT.length] : "#DEDAF0"} />
            <ellipse cx={s.x} cy={s.y - 3} rx="21" ry="7.5" fill={on ? DOT[i % DOT.length] : "#E8E5F5"} />
            <ellipse cx={s.x} cy={s.y - 3} rx="13" ry="4.5" fill="#fff" opacity=".55" />
          </g>
        );
      })}

      {/* 主人公 */}
      <g transform="translate(163,486) scale(0.55)">
        <HeroBody look={look} bg={false} />
      </g>

      <ellipse cx="62" cy="150" rx="30" ry="10" fill="#fff" opacity=".65" />
      <ellipse cx="300" cy="248" rx="26" ry="9" fill="#fff" opacity=".55" />
    </svg>
  );
}

const ic = { fill: "none", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
const HomeIcon = ({ color }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" stroke={color} {...ic}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.8V20h13V9.8" />
  </svg>
);
const CompassIcon = ({ color, active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" stroke={color} {...ic}>
    <circle cx="12" cy="12" r="9" fill={active ? color : "none"} stroke={color} />
    <path d="M15 9l-2 5-4 1 2-5z" stroke={active ? "#fff" : color} fill="none" />
  </svg>
);
const PenIcon = ({ color }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" stroke={color} {...ic}>
    <path d="M4 20l4-1 11-11-3-3L5 16z" />
  </svg>
);
const SearchIcon = ({ color }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" stroke={color} {...ic}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </svg>
);

/* ───────── スタイル ───────── */
const shell = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#EFEBFF 0%,#F4F0FB 50%,#FBF5EF 100%)",
  fontFamily: font,
  color: C.ink,
  display: "flex",
  justifyContent: "center",
};
const frame = { width: "100%", maxWidth: 430, position: "relative" };
const h2 = { fontSize: 22, lineHeight: 1.55, margin: "10px 0 0", fontWeight: 700 };
const lead = { fontSize: 13, color: C.sub, lineHeight: 1.9, margin: "10px 0 0" };
const panel = {
  background: C.card,
  borderRadius: 18,
  padding: "15px 16px",
  marginBottom: 12,
  boxShadow: "0 6px 20px rgba(90,70,160,.08)",
};
const violetPanel = {
  background: C.violet,
  color: "#fff",
  borderRadius: 18,
  padding: 16,
  marginTop: 12,
  marginBottom: 12,
  textAlign: "left",
};
const softPanel = { background: C.violetSoft, borderRadius: 14, padding: "12px 14px", marginTop: 12 };
const question = { fontSize: 18, fontWeight: 700, lineHeight: 1.75, margin: "0 0 14px" };
const bubble = {
  fontSize: 14,
  lineHeight: 1.9,
  color: C.sub,
  background: C.card,
  borderRadius: 14,
  padding: "12px 14px",
  margin: "0 0 22px",
  whiteSpace: "pre-wrap",
};
const ta = {
  width: "100%",
  boxSizing: "border-box",
  background: C.card,
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: 14,
  fontSize: 15,
  lineHeight: 1.8,
  fontFamily: font,
  color: C.ink,
  resize: "none",
};
const btn = {
  width: "100%",
  marginTop: 16,
  padding: 16,
  background: C.violet,
  color: "#fff",
  border: "none",
  borderRadius: 16,
  fontSize: 15.5,
  fontWeight: 700,
  fontFamily: font,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(124,92,224,.3)",
};
const ghost = (disabled) => ({
  width: "100%",
  marginTop: 10,
  padding: 14,
  background: "transparent",
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  color: disabled ? "#CFC9E2" : C.sub,
  fontSize: 13,
  fontFamily: font,
  cursor: disabled ? "default" : "pointer",
});
const choice = {
  width: "100%",
  marginBottom: 10,
  padding: "16px 18px",
  background: C.card,
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  fontSize: 14.5,
  fontFamily: font,
  color: C.ink,
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(90,70,160,.06)",
};
const badge = {
  width: 74,
  height: 74,
  margin: "0 auto",
  borderRadius: "50%",
  background: C.violet,
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 24,
  fontWeight: 700,
  boxShadow: "0 10px 30px rgba(124,92,224,.4)",
};
const pill = {
  background: C.card,
  border: "none",
  borderRadius: 999,
  padding: "9px 13px",
  fontSize: 11.5,
  fontWeight: 700,
  color: C.ink,
  fontFamily: font,
  boxShadow: "0 4px 14px rgba(90,70,160,.12)",
  cursor: "pointer",
  flexShrink: 0,
};
const helpBtn = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: `1px solid ${C.line}`,
  background: C.card,
  color: C.sub,
  fontSize: 14,
  fontFamily: font,
  cursor: "pointer",
  flexShrink: 0,
};
const chipWrap = { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 };
const chip = {
  background: C.violetSoft,
  color: C.violet,
  borderRadius: 999,
  padding: "5px 12px",
  fontSize: 12.5,
  fontWeight: 700,
};
const tagBtn = {
  padding: "9px 14px",
  borderRadius: 999,
  border: `1px solid ${C.line}`,
  fontSize: 13,
  fontFamily: font,
  cursor: "pointer",
  transition: "all .15s ease",
};
const hintChip = {
  background: "#FAF9FF",
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  padding: "7px 12px",
  fontSize: 12,
  color: C.sub,
  fontFamily: font,
  cursor: "pointer",
};
const label = { fontSize: 12, color: C.sub, marginBottom: 8 };
const empty = { textAlign: "center", fontSize: 13, color: C.sub, lineHeight: 2, margin: "34px 0" };
const barBg = { height: 7, background: C.violetSoft, borderRadius: 99 };
const barFill = { height: 7, background: C.violet, borderRadius: 99, transition: "width .4s ease" };
const sheetBg = {
  position: "fixed",
  inset: 0,
  background: "rgba(43,37,69,.4)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 20,
};
const sheet = {
  width: "100%",
  maxWidth: 430,
  background: "#F7F5FF",
  borderRadius: "24px 24px 0 0",
  padding: "22px 20px 28px",
  maxHeight: "82vh",
  overflowY: "auto",
};
const tabWrap = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  padding: "0 16px 14px",
  pointerEvents: "none",
  zIndex: 10,
};
const tabBar = {
  width: "100%",
  maxWidth: 398,
  display: "flex",
  background: "rgba(255,255,255,.97)",
  borderRadius: 26,
  padding: "8px 4px",
  boxShadow: "0 8px 26px rgba(90,70,160,.16)",
  pointerEvents: "auto",
};
const tabBtn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "4px 2px",
  fontFamily: font,
};
const errStyle = { fontSize: 12, color: C.pink, marginTop: 10 };
