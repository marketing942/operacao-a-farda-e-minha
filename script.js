/* =========================================================
   CPPEM · Desafio "Operação A Farda é Minha"
   Formulário → Google Sheets + GTM + WhatsApp | contagem regressiva
   ========================================================= */

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxdFplWVSfhTjvyIA7HIWb645xRjGNhBVhTdTf5UMjo0lSpW_A_jCuys0qB4uImKXPQ/exec?aba=FARDA";

/* 👉 Troque pelo link do GRUPO do desafio quando ele existir. */
const WHATSAPP_REDIRECT = "https://wa.me/5581973105354?text=Quero%20entrar%20no%20Desafio%20Opera%C3%A7%C3%A3o%20A%20Farda%20%C3%A9%20Minha!%20%F0%9F%94%B4%F0%9F%94%A5";

/* Início do Dia 1: 24/07 às 12h12 (horário de Brasília, UTC-3) */
const CHALLENGE_START = new Date("2026-07-24T12:12:00-03:00");

/* --- Elementos --- */
const form = document.getElementById("lead-form");
const telefoneInput = document.getElementById("telefone");
const modal = document.getElementById("lead-modal");
const openBtn = document.getElementById("open-modal");
const submitBtn = document.getElementById("IPEyzyfmJhKQEYIXAlZH");

/* --- Popup / Modal --- */
function openModal() {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("nome")?.focus(), 60);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* Todos os gatilhos que abrem o popup: botão principal + "Suporte via WhatsApp" no rodapé */
document
  .querySelectorAll("#open-modal, [data-open-modal]")
  .forEach((el) => el.addEventListener("click", openModal));

if (modal) {
  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* Campo de WhatsApp livre: sem máscara e sem formato obrigatório.
   O placeholder apenas indica o formato sugerido. */

/* --- Contagem regressiva para o Dia 1 --- */
(function countdown() {
  const box = document.getElementById("countdown");
  if (!box) return;

  const els = {
    d: document.getElementById("cd-d"),
    h: document.getElementById("cd-h"),
    m: document.getElementById("cd-m"),
    s: document.getElementById("cd-s")
  };
  const label = box.querySelector(".countdown__label");
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = CHALLENGE_START.getTime() - Date.now();

    if (diff <= 0) {
      box.classList.add("is-live");
      if (label) label.textContent = "A operação já começou, entre agora";
      ["d", "h", "m", "s"].forEach((k) => els[k] && (els[k].textContent = "00"));
      return;
    }

    const total = Math.floor(diff / 1000);

    if (els.d) els.d.textContent = pad(Math.floor(total / 86400));
    if (els.h) els.h.textContent = pad(Math.floor((total % 86400) / 3600));
    if (els.m) els.m.textContent = pad(Math.floor((total % 3600) / 60));
    if (els.s) els.s.textContent = pad(total % 60);

    setTimeout(tick, 1000);
  }

  tick();
})();

/* --- Validação --- */
function setError(id, msg) {
  const input = document.getElementById(id);
  const errorEl = document.querySelector(`[data-error-for="${id}"]`);

  if (input) input.classList.add("is-invalid");
  if (errorEl) errorEl.textContent = msg;
}

function clearError(id) {
  const input = document.getElementById(id);
  const errorEl = document.querySelector(`[data-error-for="${id}"]`);

  if (input) input.classList.remove("is-invalid");
  if (errorEl) errorEl.textContent = "";
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function validate() {
  let ok = true;

  const nome = document.getElementById("nome")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const tel = telefoneInput?.value.trim() || "";

  ["nome", "email", "telefone"].forEach(clearError);

  if (nome.length < 2) {
    setError("nome", "Informe seu nome completo.");
    ok = false;
  }

  if (!isEmail(email)) {
    setError("email", "Informe um e-mail válido.");
    ok = false;
  }

  // WhatsApp livre: sem formato nem quantidade de dígitos obrigatória.
  // Só não pode ficar em branco.
  if (tel.length === 0) {
    setError("telefone", "Informe o seu WhatsApp.");
    ok = false;
  }

  return ok;
}

/* Limpa o erro assim que a pessoa começa a corrigir o campo. */
["nome", "email", "telefone"].forEach((id) => {
  document.getElementById(id)?.addEventListener("input", () => clearError(id));
});

/* --- Trava do clique no botão de envio ---
   Fica no WINDOW e na fase de CAPTURA, que é o primeiro ponto do caminho de um
   clique. Por isso roda antes de qualquer listener de pixel ou tag, inclusive
   dos que são registrados no próprio botão e dos que carregam depois desta
   página. Com algum campo faltando o clique morre aqui: não vira envio e não
   chega em ninguém, então nenhum pixel amarrado ao id do botão conta evento.
   Só com tudo preenchido o clique segue o caminho normal. */
window.addEventListener(
  "click",
  (e) => {
    const alvo = e.target instanceof Element ? e.target.closest("button, input") : null;

    // Só interessa o botão de envio do formulário.
    if (!alvo || (submitBtn ? alvo !== submitBtn : alvo.type !== "submit")) return;
    if (!form || !form.contains(alvo)) return;

    if (validate()) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    document.querySelector(".is-invalid")?.focus();
  },
  true
);

/* --- Envio --- */
let isSubmitting = false;

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    isSubmitting = true;

    const btn = submitBtn || form.querySelector("button[type='submit']");

    const btnLabel = btn ? btn.textContent : "";

    if (btn) {
      btn.disabled = true;
      btn.textContent = "ENVIANDO...";
    }

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = telefoneInput.value.trim();

    const payload = {
      nome: nome,
      email: email,
      telefone: telefone,
      origem: "desafio_operacao_a_farda_e_minha",
      pagina: window.location.href,
      data_envio: new Date().toISOString()
    };

    try {
      // 1. Envia primeiro para o Google Sheets
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      // 2. Só agora, com os dados validados e enviados, o lead é contado.
      //    O eventCallback segura o redirect até a tag do GTM disparar, com
      //    teto de 1,2s pra ninguém ficar preso caso o GTM não responda.
      form.reset();
      closeModal();

      let jaFoi = false;
      const irParaWhatsApp = () => {
        if (jaFoi) return;
        jaFoi = true;
        window.location.href = WHATSAPP_REDIRECT;
      };

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "lead",
          lead_name: nome,
          lead_email: email,
          lead_phone: telefone,
          page_url: window.location.href,
          eventCallback: irParaWhatsApp,
          eventTimeout: 1200
        });
      } catch (dlError) {
        console.warn("[GTM] Erro ao enviar evento de lead:", dlError);
      }

      // 3. Rede de segurança: se o GTM não chamar o callback, redireciona igual.
      setTimeout(irParaWhatsApp, 1200);

    } catch (err) {
      console.error("[Form] Erro ao enviar:", err);

      setError("telefone", "Erro ao enviar. Tente novamente.");

      isSubmitting = false;

      if (btn) {
        btn.disabled = false;
        btn.textContent = btnLabel || "ENTRAR NO GRUPO DO DESAFIO";
      }
    }
  });
}
