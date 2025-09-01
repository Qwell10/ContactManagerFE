document.addEventListener('DOMContentLoaded', () => {
    const contactsList = document.getElementById('contacts-list');
    const API_URL_FETCH = 'http://localhost:8080/contact/findContacts';
    const API_URL_SAVE = 'http://localhost:8080/contact/saveNewContact';

    // Konstanty pro modální okno "Přidat kontakt"
    const addContactBtn = document.getElementById('add-contact-btn');
    const addContactModal = document.getElementById('add-contact-modal');
    const addContactCloseBtn = addContactModal.querySelector('.close-btn');
    const addContactForm = document.getElementById('add-contact-form');

    // Konstanty pro modální okno "Aktualizovat údaje"
    const updateContactModal = document.getElementById('update-contact-modal');
    const updateContactCloseBtn = updateContactModal.querySelector('.close-btn');

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
                    <h3><span class="name">${contact.name}</span></h3>
                    <p><strong>Email:</strong> <span class="email">${contact.email}</span></p>
                    <p><strong>Telefon:</strong> <span class="phone">${contact.phoneNumber}</span></p>
                    <button class="delete-btn">Smazat</button>
                    <button class="update-btn">Upravit</button>
                `;

                // Přidání posluchače na tlačítko pro smazání
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Opravdu chcete smazat kontakt ${contact.name}?`)) {
                        deleteContact(contact.name);
                    }
                });

                // Přidání posluchače na tlačítko pro úpravu
                const updateBtn = li.querySelector('.update-btn');
                updateBtn.addEventListener('click', () => {
                    if (updateContactModal) {
                        const nameInput = updateContactModal.querySelector('#name');
                        const emailInput = updateContactModal.querySelector('#email');
                        const phoneInput = updateContactModal.querySelector('#phone');

                        nameInput.value = contact.name;
                        emailInput.value = contact.email;
                        phoneInput.value = contact.phoneNumber;

                        updateContactModal.style.display = 'block';
                    } else {
                        console.error('Chyba: Modální okno pro aktualizaci nebylo nalezeno.');
                    }
                });

                contactsList.appendChild(li);
            });

        } catch (error) {
            console.error('Došlo k chybě při načítání kontaktů:', error);
            contactsList.innerHTML = '<p>Nepodařilo se načíst kontakty. Zkontrolujte, zda je server spuštěn.</p>';
        }
    }

    // Otevření modálního okna "Přidat kontakt"
    addContactBtn.addEventListener('click', () => {
        addContactModal.style.display = 'flex';
    });

    // Zavření modálních oken kliknutím na křížek
    addContactCloseBtn.addEventListener('click', () => {
        addContactModal.style.display = 'none';
    });
    updateContactCloseBtn.addEventListener('click', () => {
        updateContactModal.style.display = 'none';
    });

    // Zavření modálních oken kliknutím mimo ně
    window.addEventListener('click', (event) => {
        if (event.target === addContactModal) {
            addContactModal.style.display = 'none';
        }
        if (event.target === updateContactModal) {
            updateContactModal.style.display = 'none';
        }
    });

    // Odeslání formuláře pro přidání kontaktu
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
            addContactModal.style.display = 'none';
            fetchContacts();

        } catch (error) {
            console.error('Došlo k chybě:', error);
            alert('Nepodařilo se uložit kontakt. Zkontrolujte, zda je server spuštěn a správně nakonfigurován pro POST požadavky.');
        }
    });

    function getDeleteUrl(contactName) {
        return `http://localhost:8080/contact/deleteContact/${contactName}`;
    }

    // Funkce pro smazání kontaktu
    async function deleteContact(contactName) {
        try {
            const response = await fetch(getDeleteUrl(contactName), {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Chyba při mazání: ${response.status}`);
            }
            console.log(`Kontakt ${contactName} byl úspěšně smazán.`);
            fetchContacts();
        } catch (error) {
            console.error('Došlo k chybě při mazání kontaktu:', error);
            alert('Nepodařilo se smazat kontakt. Zkontrolujte, zda je server spuštěn a správně nakonfigurován pro DELETE požadavky.');
        }
    }

    fetchContacts();
});