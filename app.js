document.addEventListener('DOMContentLoaded', () => {
    // Definice proměnných pro kontakty
    const contactsList = document.getElementById('contacts-list');
    const API_URL_FETCH = 'http://localhost:8080/contact/findContacts';
    const API_URL_SAVE = 'http://localhost:8080/contact/saveNewContact';

    // Definice proměnných pro modální okno a formulář
    const addContactBtn = document.getElementById('add-contact-btn');
    const modal = document.getElementById('add-contact-modal');
    const closeBtn = document.querySelector('.close-btn');
    const addContactForm = document.getElementById('add-contact-form');

    // Funkce pro načtení kontaktů
    async function fetchContacts() {
        try {
            const response = await fetch(API_URL_FETCH);
            if (!response.ok) {
                throw new Error(`Chyba HTTP: ${response.status}`);
            }
            const contacts = await response.json();

            contactsList.innerHTML = ''; // Vyčistí seznam

            if (contacts.length === 0) {
                contactsList.innerHTML = '<p>Žádné kontakty nebyly nalezeny.</p>';
                return;
            }

            contacts.forEach(contact => {
                const li = document.createElement('li');
                li.className = 'contact-item';
                li.innerHTML = `
                    <h3>${contact.name}</h3>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Telefon:</strong> ${contact.phoneNumber}</p>
                `;
                contactsList.appendChild(li);
            });

        } catch (error) {
            console.error('Došlo k chybě při načítání kontaktů:', error);
            contactsList.innerHTML = '<p>Nepodařilo se načíst kontakty. Zkontrolujte, zda je server spuštěn.</p>';
        }
    }

    // Otevření modálního okna
    addContactBtn.onclick = function() {
        modal.style.display = 'flex';
    }

    // Zavření modálního okna kliknutím na křížek
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Zavření modálního okna kliknutím mimo něj
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Odeslání formuláře
    addContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phoneNumber').value;

        try {
            const response = await fetch(API_URL_SAVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phoneNumber })
            });

            if (!response.ok) {
                throw new Error('Chyba při ukládání kontaktu.');
            }

            addContactForm.reset();
            modal.style.display = 'none';
            fetchContacts();

        } catch (error) {
            console.error('Došlo k chybě:', error);
            alert('Nepodařilo se uložit kontakt. Zkontrolujte, zda je server spuštěn a správně nakonfigurován pro POST požadavky.');
        }
    });

    // Spuštění načítání kontaktů při načtení stránky (tato část je klíčová pro zobrazení dat hned po načtení)
    fetchContacts();
});