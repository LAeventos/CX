const form = document.getElementById("reservationForm");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const statusBox = document.getElementById("formStatus");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const dateInput = document.getElementById("data");
const phoneInput = document.getElementById("telefone");
const formSubject = document.getElementById("formSubject");
const web3AccessKey = document.getElementById("web3AccessKey");

document.getElementById("currentYear").textContent = new Date().getFullYear();

// Não permite reservar uma data anterior ao dia atual.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
dateInput.min = localToday;

// Máscara simples de telefone brasileiro.
phoneInput.addEventListener("input", (event) => {
  let value = event.target.value.replace(/\D/g, "").slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  } else if (value.length > 0) {
    value = value.replace(/^(\d{0,2})/, "($1");
  }

  event.target.value = value;
});

function openSuccessModal() {
  successModal.classList.add("show");
  successModal.setAttribute("aria-hidden", "false");
  closeModal.focus();
}

function closeSuccessModal() {
  successModal.classList.remove("show");
  successModal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeSuccessModal);
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) closeSuccessModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && successModal.classList.contains("show")) {
    closeSuccessModal();
  }
});

// Ao voltar do Web3Forms, mostra a confirmação dentro do próprio site.
const params = new URLSearchParams(window.location.search);
if (params.get("enviado") === "1") {
  statusBox.textContent = "Reserva enviada com sucesso.";
  statusBox.className = "form-status success";
  openSuccessModal();

  // Limpa ?enviado=1 da barra sem recarregar a página.
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Mantemos JavaScript apenas para validação e assunto dinâmico.
// O envio é HTML normal para o Web3Forms, sem fetch/AJAX.
form.addEventListener("submit", (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    form.reportValidity();
    return;
  }

  // Honeypot contra bots.
  if (document.getElementById("website").checked) {
    event.preventDefault();
    return;
  }

  // Evita publicar por engano antes de configurar a chave do Web3Forms.
  if (!web3AccessKey.value || web3AccessKey.value === "COLE_AQUI_SUA_ACCESS_KEY") {
    event.preventDefault();
    statusBox.textContent = "Falta configurar a chave de envio do Web3Forms no index.html.";
    statusBox.className = "form-status error";
    return;
  }

  const local = document.getElementById("local").value;
  const nome = document.getElementById("nome").value.trim();
  formSubject.value = `PowerBank - ${local} - ${nome}`;

  submitBtn.disabled = true;
  submitText.textContent = "ENVIANDO...";
  statusBox.textContent = "Enviando sua reserva...";
  statusBox.className = "form-status";

  // Não usamos preventDefault aqui: o navegador envia o formulário
  // diretamente ao Web3Forms, sem depender de fetch/AJAX.
});
