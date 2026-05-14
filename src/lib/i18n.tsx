import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "zh";

const KEY = "candor:lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Lang | null;
      if (saved === "en" || saved === "zh") setLangState(saved);
    } catch {}
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

export function useT() {
  const { lang } = useLang();
  return T[lang];
}

const T = {
  en: {
    nav: { repo: "My Repo", privacy: "Privacy", back: "← Back home" },
    home: {
      eyebrow: "Feedback is a gift.",
      h1a: "Debug Your Career.",
      h1b: "With",
      h1c: "Love",
      h1d: "(and a few laughs).",
      sub: "Write feedback for teammates the way top engineers do code review — zero fluff, high signal, with a touch of humor. Every line ships them a little better.",
      cta1Idle: "Open My Repo →",
      cta1Loading: "Spinning up…",
      cta2: "How it works ↓",
      legal: "Anonymous by default. No names, no IPs, no fingerprints.",
      copied: "Repo link copied",
      copyAgain: "Copy again",
      openRepo: "Open repo",
      howKicker: "How it works",
      how: [
        {
          k: "01",
          t: "Spin up your repo",
          d: "Generate a personal feedback link. Drop it in your bio, share it with your team, or hand it to that PM you have a crush on.",
        },
        {
          k: "02",
          t: "Teammates open PRs",
          d: "They write structured feedback: core strengths, optimization suggestions, and the one thing they'd push you to fix.",
        },
        {
          k: "03",
          t: "Merge what makes you better",
          d: "Read, decide, ship. V2.0 of yourself — and your team.",
        },
      ],
      footer: "Privacy First. No Cap. →",
      genFail: "Couldn't spin up your repo. Try again.",
    },
    inbox: {
      h1: "Your Personal Repo",
      sub: "Everyone is a beta build with bugs. Welcome your teammates to PR you 🧑‍💻",
      copy: "Copy",
      newLink: "+ New",
      spinUp: "Spin up repo",
      loading: "Loading…",
      emptyAll:
        "Zero feedback yet. Either you're already a 10x engineer, or your teammates are still leveling up «things-I-shouldn't-say» 🌳",
      footer: "Be honest. Be kind. Ship better.",
      counts: (unread: number, total: number) =>
        `${unread} unread · ${total} total`,
      newDot: "NEW",
    },
    submit: {
      eyebrow: "Code Review",
      h1: "Reviewing",
      h1Sub: "your teammate",
      lead: "One honest line beats ten polite ones.",
      warmup: "Need a warm-up? Tap a few tags below — totally optional.",
      strengthsTitle: "Core Strengths",
      suggestionsTitle: "Optimization Suggestions",
      multi: "optional · multi-select",
      oneKicker: "The One Thing",
      oneH: "If you were their co-founder,",
      oneH2: "what's the",
      oneHEm: "ONE",
      oneH3: "thing you'd push them to fix?",
      onePlaceholder:
        "Be honest, be funny — just don't write «keep going». Real talk is what's worth the most here.",
      ship: "Ship it 🚀",
      shipping: "Shipping…",
      legal: "Delivered as written. Anonymous by default.",
      legalLink: "How we handle this",
      doneEyebrow: "Delivered",
      doneH1: "✅ Your note just landed on their desk.",
      doneSub: "Sent word-for-word. No name attached — unless you signed it.",
      doneSee: "What they'll read",
      installH: "Curious what people really think of you?",
      installP:
        "Spin up your own repo and let honest feedback find you. Two clicks to a better you.",
      installCta: "Spin up my repo →",
      backup: "Backup",
      another: "Submit another PR",
      strengths: [
        { id: "vision", emoji: "👁️", label: "Visionary (Altman Mode)", desc: "Sees three steps ahead" },
        { id: "exec", emoji: "🚀", label: "Execution Beast", desc: "Ships so fast even AI feels slow" },
        { id: "first", emoji: "🧠", label: "First-Principles Master", desc: "Breaks problems down to atoms" },
        { id: "comm", emoji: "📢", label: "10x Communicator", desc: "Even PMs get it on the first pass" },
      ],
      suggestions: [
        { id: "async", emoji: "⚡", label: "Default to Async", desc: "If Slack works, don't open Zoom" },
        { id: "ship", emoji: "🎯", label: "Break Analysis Paralysis", desc: "Ship at 70%, iterate live" },
        { id: "no", emoji: "🛡️", label: "Say No Like a Pro", desc: "Strategic refusal beats «sure I'll do it»" },
        { id: "short", emoji: "✂️", label: "Write Shorter", desc: "Cut the email in half. Everyone wins." },
      ],
      coFounderPrefix: "If I were your co-founder…",
      strengthsPrefix: "✅ Strengths",
      suggestionsPrefix: "🛠 Suggestions",
      submitFail: "Failed to ship. Try again.",
    },
    privacy: {
      kicker: "Privacy",
      h1: "Privacy First. No Cap.",
      lead:
        "We protect your privacy more obsessively than Apple. No traceable logs. No identity linking. We don't sell anything.",
      cards: [
        {
          t: "No identity",
          d: "No email, no phone, no IP, no browser fingerprint. You're just an anonymous bubble that types.",
        },
        {
          t: "No traceable logs",
          d: "We don't keep access logs that can point back to a person. The backend only knows «someone submitted feedback». Not who.",
        },
      ],
      hashtag: "",
      tag: "",
      eggBtn: "Still skeptical?",
      eggH: "Anonymous or I die. On god.",
      eggSub: "We can't find it. Your boss can't find it. You can't find it.",
    },
    thanks: {
      logoBack: "Candor",
      loading: "Loading…",
      goneH: "This response is gone",
      goneSub: "The link might be wrong, or the conversation has ended.",
      eyebrow: "PR response",
      h1: "Your patch got a response.",
      yourPR: "Your PR",
      noReply: "They haven't responded yet. Go do something else.",
      from: "from the repo owner",
    },
  },
  zh: {
    nav: { repo: "我的 Repo", privacy: "隐私", back: "← 回到首页" },
    home: {
      eyebrow: "Feedback is a gift.",
      h1a: "把你的职业生涯，Debug 一下。",
      h1b: "带点",
      h1c: "爱",
      h1d: "，再加一点笑点。",
      sub: "给同事写反馈，像顶级工程师做 Code Review——零废话，高信噪比，带一点梗，每一句都让人变强。",
      cta1Idle: "打开我的 Repo →",
      cta1Loading: "生成中…",
      cta2: "工作流程 ↓",
      legal: "默认匿名。不要名字、不记 IP、不打指纹。",
      copied: "链接已复制",
      copyAgain: "再复制一次",
      openRepo: "去 Repo",
      howKicker: "How it works",
      how: [
        {
          k: "01",
          t: "创建你的 Repo",
          d: "生成一个收反馈的专属链接。挂在个人资料页、转给你的团队，或者直接发给那位你暗恋的产品经理。",
        },
        {
          k: "02",
          t: "队友提 PR",
          d: "他们用结构化模板写反馈：核心优势、优化建议、以及最该改的那一件事。",
        },
        {
          k: "03",
          t: "Merge 你想要的",
          d: "读一读，做决定，回个话。Ship V2.0 of yourself.",
        },
      ],
      footer: "隐私至上，绝不糊弄 →",
      genFail: "生成失败，请重试。",
    },
    inbox: {
      h1: "Your Personal Repo",
      sub: "每个人都是带 Bug 的 Beta 版本。欢迎队友来 PR 🧑‍💻",
      copy: "复制",
      newLink: "+ 新链接",
      spinUp: "创建 Repo",
      loading: "加载中…",
      emptyAll:
        "目前零反馈。要么你已经是 10x Engineer，要么大家还在偷偷点「这个我不好说」的技能树 🌳",
      footer: "诚实，温柔，让自己变好。",
      counts: (unread: number, total: number) =>
        `${unread} 条未读 · 共 ${total} 条`,
      newDot: "NEW",
    },
    submit: {
      eyebrow: "Code Review",
      h1: "Reviewing",
      h1Sub: "你的队友",
      lead: "一句真心话，胜过十句客套。",
      warmup: "需要点灵感？下面的标签可选可不选。",
      strengthsTitle: "核心优势",
      suggestionsTitle: "优化建议",
      multi: "可不选 · 可多选",
      oneKicker: "The One Thing",
      oneH: "如果你是 TA 的 co-founder，",
      oneH2: "你最想推 TA 改的",
      oneHEm: "那一件",
      oneH3: "事是什么？",
      onePlaceholder: "可以真实，可以带梗，但别只说「加油」。真心话在这里最值钱。",
      ship: "Ship it 🚀",
      shipping: "送出中…",
      legal: "原文直接送达，不署名，不记 IP。",
      legalLink: "我们怎么处理这些字",
      doneEyebrow: "已送达",
      doneH1: "✅ 你这句话，已经放到 TA 桌上了。",
      doneSub: "原文送达。没人知道是你写的——除非你署了名。",
      doneSee: "TA 会看到",
      installH: "想知道别人眼中真实的你？",
      installP:
        "创建你自己的 Repo，让真诚的反馈主动找上门——两次点击，遇见更好的自己。",
      installCta: "创建我的 Repo →",
      backup: "备用链接",
      another: "再写一条",
      strengths: [
        { id: "vision", emoji: "👁️", label: "Visionary (Altman Mode)", desc: "看问题快人三步" },
        { id: "exec", emoji: "🚀", label: "Execution Beast", desc: "产出快到让 AI 都想躺平" },
        { id: "first", emoji: "🧠", label: "First-Principles Master", desc: "拆问题拆到原子级" },
        { id: "comm", emoji: "📢", label: "10x Communicator", desc: "连 PM 都能一次听懂" },
      ],
      suggestions: [
        { id: "async", emoji: "⚡", label: "Default to Async", desc: "能 Slack 就别 Zoom" },
        { id: "ship", emoji: "🎯", label: "Break Analysis Paralysis", desc: "70 分先 launch，迭代里改" },
        { id: "no", emoji: "🛡️", label: "Say No Like a Pro", desc: "战略性拒绝，别被「好我来」淹没" },
        { id: "short", emoji: "✂️", label: "Write Shorter", desc: "邮件砍一半，世界更清净" },
      ],
      coFounderPrefix: "If I were your co-founder…",
      strengthsPrefix: "✅ 优势",
      suggestionsPrefix: "🛠 建议",
      submitFail: "送出失败，请重试。",
    },
    privacy: {
      kicker: "隐私",
      h1: "隐私至上，绝不糊弄。",
      lead: "我们对隐私的保护，比苹果还 paranoid。不留可追溯日志，不关联身份，不卖数据。",
      cards: [
        {
          t: "不要身份",
          d: "不要邮箱、不要手机号、不记 IP、不打浏览器指纹。你只是个会打字的神秘气泡。",
        },
        {
          t: "无可追溯日志",
          d: "我们不存可关联到访问者的访问日志。后端只知道「有人提交了一条反馈」，不知道是谁。",
        },
      ],
      hashtag: "",
      tag: "",
      eggBtn: "还是不放心？",
      eggH: "不匿名死全家。",
      eggSub: "我们查不到，老板查不到，你自己也查不到。",
    },
    thanks: {
      logoBack: "Candor",
      loading: "加载中…",
      goneH: "这条回响不在了",
      goneSub: "链接可能错了，或者对话已经结束。",
      eyebrow: "PR 回响",
      h1: "你那条 Patch，TA 回了。",
      yourPR: "你提交的 PR",
      noReply: "TA 还没回。先去忙别的吧。",
      from: "— 来自 Repo Owner",
    },
  },
} as const;
