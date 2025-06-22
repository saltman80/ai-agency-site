(function() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    const originalButtonHTML = submitButton.innerHTML;

    function clearErrors() {
        form.querySelectorAll('.error-text').forEach(span => {
            span.textContent = '';
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach(input => {
            input.setAttribute('aria-invalid', 'false');
        });
    }

    function validate() {
        const errors = {};
        const nameInput = form.querySelector('input[name="name"]');
        const name = nameInput ? nameInput.value.trim() : '';
        const emailInput = form.querySelector('input[name="email"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const messageInput = form.querySelector('textarea[name="message"]');
        const message = messageInput ? messageInput.value.trim() : '';
        if (!name) errors.name = 'Name is required.';
        if (!email) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email is invalid.';
        }
        if (!message) errors.message = 'Message is required.';
        return errors;
    }

    function showErrors(errors) {
        Object.keys(errors).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.setAttribute('aria-invalid', 'true');
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    const errorSpan = formGroup.querySelector('.error-text');
                    if (errorSpan) {
                        errorSpan.textContent = errors[key];
                    }
                } else {
                    console.warn(`Form group not found for input "${key}"`);
                }
            }
        });
    }

    function setLoading(loading) {
        if (loading) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            submitButton.setAttribute('aria-label', 'Submitting');
            submitButton.innerHTML = '<span class="spinner" aria-hidden="true"></span> Submitting...';
        } else {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.removeAttribute('aria-label');
            submitButton.innerHTML = originalButtonHTML;
        }
    }

    async function sendData() {
        const formData = new FormData(form);
        const endpoint = form.getAttribute('action') || '/contact';
        const method = form.getAttribute('method') || 'POST';
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    function showCheckmark() {
        submitButton.innerHTML = '<span class="checkmark" aria-hidden="true">?</span>';
        submitButton.classList.add('success');
        setTimeout(() => {
            submitButton.classList.remove('success');
            form.reset();
            setLoading(false);
        }, 2000);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            showErrors(errors);
            return;
        }
        setLoading(true);
        try {
            await sendData();
            showCheckmark();
        } catch (err) {
            setLoading(false);
            const generalError = form.querySelector('.form-error');
            if (generalError) {
                generalError.textContent = 'An error occurred. Please try again.';
            }
            console.error(err);
        }
    });
})();