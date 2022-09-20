;(() => {
  'use strict'
  function e(e) {
    return new Promise((t, i) => {
      chrome.storage.local.get([e], function (n) {
        void 0 === n[e] ? i() : t(n[e])
      })
    })
  }
  function t(e) {
    return new Promise((t, i) => {
      chrome.storage.local.set({ allTabs: e }, function () {
        console.log(null != e ? e : []), t()
      })
    })
  }
  var i = function (e, t, i, n) {
    return new (i || (i = Promise))(function (o, l) {
      function r(e) {
        try {
          d(n.next(e))
        } catch (e) {
          l(e)
        }
      }
      function c(e) {
        try {
          d(n.throw(e))
        } catch (e) {
          l(e)
        }
      }
      function d(e) {
        var t
        e.done
          ? o(e.value)
          : ((t = e.value),
            t instanceof i
              ? t
              : new i(function (e) {
                  e(t)
                })).then(r, c)
      }
      d((n = n.apply(e, t || [])).next())
    })
  }
  chrome.storage.local.set({ allTabs: [] })
  let n,
    o,
    l,
    r,
    c = 0,
    d = { id: 0, domain: '', url: '', title: '', sec: 0 }
  function s() {
    return i(this, void 0, void 0, function* () {
      let [e] = yield chrome.tabs.query({ active: !0, lastFocusedWindow: !0 })
      return e
    })
  }
  function u(n) {
    return i(this, void 0, void 0, function* () {
      if (o != n.url || l != n.title)
        if (
          yield (function (t) {
            return i(this, void 0, void 0, function* () {
              let i = yield e('allTabs')
              if (0 != i.length) {
                for (let e = 0; e < i.length; e++)
                  if (i[e].domain === t)
                    return console.log(i[e].domain + ' ' + t), !0
                return !1
              }
              return !1
            })
          })(n.domain)
        ) {
          ;(o = n.url), (l = n.title)
          let i = yield e('allTabs')
          for (let e = 0; e < i.length; e++)
            n.domain === i[e].domain && ((i[e].sec += n.sec), yield t(i))
        } else {
          console.log('here'), (o = n.url), (l = n.title)
          let i = yield e('allTabs')
          const r = {
            id: n.id,
            domain: n.domain,
            url: n.url,
            title: n.title,
            sec: n.sec,
          }
          i.push(r), yield t(i)
        }
    })
  }
  function a() {
    return i(this, void 0, void 0, function* () {
      clearInterval(r), console.log(`The total time was: ${c} seconds`)
      let e = yield s()
      if (!1 === e.url.includes('.')) return void console.log('invalid tab')
      n = e.id
      let t = new URL(e.url)
      ;(d = {
        id: e.id,
        domain: t.hostname,
        url: e.url,
        sec: 0,
        title: e.title,
      }),
        (c = 0),
        (r = setInterval(() => {
          c++
        }, 1e3))
    })
  }
  chrome.tabs.onActivated.addListener(function () {
    return i(this, void 0, void 0, function* () {
      if ('' === d.url) console.log('starting tab'), yield a()
      else {
        yield s()
        let e = d
        ;(e.sec = c), yield a(), yield u(e)
      }
    })
  }),
    chrome.tabs.onUpdated.addListener(function (e, t, o) {
      return i(this, void 0, void 0, function* () {
        if (n === e && 'complete' === o.status) {
          let e = d
          ;(e.sec = c), yield a(), yield u(e)
        }
      })
    })
})()
