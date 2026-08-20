const FORM_ENDPOINT = "https://formsubmit.co/ajax/Cxestacaoderecarga@gmail.com";

const form = document.getElementById("reservationForm");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const statusBox = document.getElementById("formStatus");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const dateInput = document.getElementById("data");
const phoneInput = document.getElementById("telefone");

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

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitText.textContent = isLoading ? "ENVIANDO..." : "ENVIAR RESERVA POR E-MAIL";
}

function setStatus(message = "", type = "") {
  statusBox.textContent = message;
  statusBox.className = `form-status ${type}`.trim();
}

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Honeypot contra bots.
  if (document.getElementById("website").value) return;

  setLoading(true);

  const formData = new FormData(form);
  const rawDate = formData.get("Data do evento");
  const formattedDate = rawDate
    ? new Date(`${rawDate}T12:00:00`).toLocaleDateString("pt-BR")
    : "";

  const payload = {
    "Nome completo": formData.get("Nome completo"),
    "Telefone": formData.get("Telefone"),
    "Nome do evento": formData.get("Nome do evento"),
    "Local do evento": formData.get("Local do evento"),
    "Data do evento": formattedDate,
    "Número do powerbank": formData.get("Número do powerbank"),
    "_subject": `Nova reserva de Powerbank - ${formData.get("Nome completo")}`,
    "_template": "table"
  };

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Não foi possível enviar a reserva.");
    }

    form.reset();
    dateInput.min = localToday;
    setStatus("Reserva enviada com sucesso.", "success");
    openSuccessModal();
  } catch (error) {
    console.error(error);
    setStatus(
      "Não foi possível enviar agora. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    setLoading(false);
  }
});
