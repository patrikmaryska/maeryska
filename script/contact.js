const EMAILJS_PUBLIC_KEY  = 'CFF--09EI04F2e5nY';
const EMAILJS_SERVICE_ID  = 'service_p0irhup';
const EMAILJS_TEMPLATE_ID = 'template_ovimz77';

emailjs.init(EMAILJS_PUBLIC_KEY);

document.addEventListener('DOMContentLoaded', function () {
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        status.textContent = '';
        status.className = 'form-status';

        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
            .then(function () {
                status.textContent = t('form.success');
                status.className = 'form-status form-success';
                form.reset();
                btn.disabled = false;
            }, function () {
                status.textContent = t('form.error');
                status.className = 'form-status form-error';
                btn.disabled = false;
            });
    });
});
