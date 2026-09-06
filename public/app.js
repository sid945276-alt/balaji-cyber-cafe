const form = document.getElementById("applyForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("formMsg");
  msg.textContent = "आवेदन भेजा जा रहा है...";

  try {
    const res = await fetch("/api/requests", {
      method: "POST",
      body: new FormData(form)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "त्रुटि");
    }

    msg.className = "success";
    msg.innerHTML = `
      आवेदन सफलतापूर्वक भेज दिया गया।<br>
      आपकी Request ID: <strong>${data.requestId}</strong><br>
      इसे संभालकर रखें।
    `;

    form.reset();

  } catch (err) {
    msg.className = "error";
    msg.textContent = err.message;
  }
});

async function track() {
  const id = document.getElementById("trackId").value.trim();
  const out = document.getElementById("trackResult");

  if (!id) {
    out.textContent = "Request ID डालें।";
    return;
  }

  try {
    const r = await fetch("/api/track/" + encodeURIComponent(id));
    const d = await r.json();

    if (!r.ok) {
      throw new Error(d.error);
    }

    out.innerHTML = `
      <div class="success">
        <b>${d.service}</b><br>
        नाम: ${d.name}<br>
        स्थिति: <strong>${d.status}</strong><br>
        भुगतान: ${d.payment_status}<br>
        Request ID: ${d.request_id}
      </div>
    `;

  } catch (e) {
    out.innerHTML = `<div class="error">${e.message}</div>`;
  }
}
