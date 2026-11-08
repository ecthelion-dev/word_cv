/**
 * 05-transliterate.js — Kirill va Lotin yozuvlari oʻrtasida oʻgirish (cyrToLat, latToCyr, convertScript)
 */
  const Bt = "аеёиоуўэюяыАЕЁИОУЎЭЮЯЫ",
    Wt = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      ж: "j",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "x",
      ч: "ch",
      ш: "sh",
      щ: "sh",
      ы: "i",
      э: "e",
      ю: "yu",
      я: "ya",
      ё: "yo",
      ў: "o‘",
      қ: "q",
      ғ: "g‘",
      ҳ: "h",
      ь: "",
      ъ: "’",
    };
  function Gt(t) {
    let e = "";
    const n = [...t];
    for (let t = 0; t < n.length; t++) {
      const s = n[t],
        i = s.toLowerCase(),
        a = s !== i,
        o = n[t - 1] || "",
        r = n[t + 1] || "";
      let l;
      if ("е" === i)
        l =
          !o || !/[а-яёўқғҳ]/i.test(o) || Bt.includes(o) || /[ъь]/i.test(o)
            ? "ye"
            : "e";
      else if ("ц" === i)
        l = o && Bt.includes(o) && r && Bt.includes(r) ? "ts" : "s";
      else {
        if (!Object.prototype.hasOwnProperty.call(Wt, i)) {
          e += s;
          continue;
        }
        l = Wt[i];
      }
      if (a && l) {
        l =
          (r && r !== r.toLowerCase()) ||
          (o && /[А-ЯЁЎҚҒҲ]/.test(o) && !(r && r !== r.toUpperCase()))
            ? l.toUpperCase()
            : l[0].toUpperCase() + l.slice(1);
      }
      e += l;
    }
    return e;
  }
  const Qt = [
      ["yo‘", "йў"],
      ["o‘", "ў"],
      ["g‘", "ғ"],
      ["sh", "ш"],
      ["ch", "ч"],
      ["yo", "ё"],
      ["yu", "ю"],
      ["ya", "я"],
      ["ye", "е"],
    ],
    Jt = {
      a: "а",
      b: "б",
      c: "с",
      d: "д",
      e: "е",
      f: "ф",
      g: "г",
      h: "ҳ",
      i: "и",
      j: "ж",
      k: "к",
      l: "л",
      m: "м",
      n: "н",
      o: "о",
      p: "п",
      q: "қ",
      r: "р",
      s: "с",
      t: "т",
      u: "у",
      v: "в",
      w: "в",
      x: "х",
      y: "й",
      z: "з",
    };
  function Vt(t) {
    const e = c(t);
    let n = "";
    for (let t = 0; t < e.length;) {
      const s = e[t],
        i = s.toLowerCase(),
        a = e[t - 1] || "",
        o = !a || !/[A-Za-z‘’]/.test(a);
      let r,
        l,
        c = null;
      for (const [n, s] of Qt)
        if (e.slice(t, t + n.length).toLowerCase() === n) {
          c = [n.length, s];
          break;
        }
      if (c) [l, r] = c;
      else if ("e" === i && o) ((l = 1), (r = "э"));
      else {
        if ("’" === s || "'" === s) {
          const i = e[t + 1] || "";
          (/[A-Za-z]/.test(a) && /[A-Za-z]/.test(i)
            ? (n += a === a.toUpperCase() && i === i.toUpperCase() ? "Ъ" : "ъ")
            : (n += s),
            t++);
          continue;
        }
        if (!Object.prototype.hasOwnProperty.call(Jt, i)) {
          ((n += s), t++);
          continue;
        }
        ((l = 1), (r = Jt[i]));
      }
      const h = e.slice(t, t + l);
      if (h[0] !== h[0].toLowerCase()) {
        const t = h.replace(/[^A-Za-z]/g, "");
        r =
          t === t.toUpperCase() && t.length > 1
            ? r.toUpperCase()
            : r[0].toUpperCase() + r.slice(1);
      }
      ((n += r), (t += l));
    }
    return n;
  }
  function Xt(t, e) {
    const n = e ? Gt : Vt,
      s = (t) => (t ? n(t) : t);
    ((t.name = s(t.name)),
      (t.since = s(t.since)),
      (t.position = s(t.position)),
      (t.relHeadingName = s(t.relHeadingName)));
    for (const e of Object.keys(t.fields)) t.fields[e] = s(t.fields[e]);
    t.work = t.work.map(s);
    for (const n of t.relatives) {
      for (const t of ["name", "birth", "work", "address"]) n[t] = s(n[t]);
      n.rel && !i.includes(n.rel) && e && (n.rel = s(n.rel));
    }
    if (!e) {
      const e = (t) =>
        t ? t.replace(/сентабр/g, "сентябр").replace(/Сентабр/g, "Сентябр") : t;
      ((t.since = e(t.since)), (t.work = t.work.map(e)));
    }
    t.S = e ? O.lat : O.cyr;
  }
