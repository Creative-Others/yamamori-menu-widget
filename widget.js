document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyAafPPmswHXIMxrv4djdgzdFMt3svA80YU';
    const SPREADSHEET_ID = '1vyo2X6vHY_az1U0IQWjr0k3cvJz9v3fxxwG3lYThdrU';
    const RANGE = 'Lunch!A2:E'; // Range to fetch the menu data
    const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const menuSectionsContainer = document.querySelector('.menu-sections');
    const menuLinksContainer = document.querySelector('.menu'); // Select the <ul> for menu links

    // Fetch data from Google Sheets
    fetch(URL)
        .then(response => response.json())
        .then(data => {
            const sectionsMap = organizeMenuData(data.values);
            updateMenuLinks(sectionsMap);
            populateMenuSections(sectionsMap);
        })
        .catch(error => console.error('Error fetching menu data:', error));

    // Organize data into sections
    function organizeMenuData(data) {
        const sectionsMap = {};

        data.forEach(row => {
            const [menuName, description, price, section, sectionDescription] = row;

            if (!sectionsMap[section]) {
                sectionsMap[section] = {
                    description: sectionDescription,
                    items: []
                };
            }

            sectionsMap[section].items.push({ menuName, description, price });
        });

        return sectionsMap;
    }

    // Update menu links dynamically
    function updateMenuLinks(sectionsMap) {
        menuLinksContainer.innerHTML = ''; // Clear existing links

        Object.keys(sectionsMap).forEach((sectionKey, index) => {
            const sectionId = sectionKey.toLowerCase().replace(/[\s\W]+/g, '-'); // Create a URL-friendly ID
            const isActive = index === 0 ? 'active' : ''; // First link is active by default

            const linkHTML = `
                <li>
                    <a href="#${sectionId}" class="menu-link ${isActive}">${sectionKey}</a>
                </li>
            `;

            menuLinksContainer.insertAdjacentHTML('beforeend', linkHTML);
        });

        // Re-attach event listeners for the dynamically added links
        attachLinkEventListeners();
    }

    // Populate the entire menu sections dynamically
    function populateMenuSections(sectionsMap) {
        menuSectionsContainer.innerHTML = ''; // Clear the container
    
        Object.keys(sectionsMap).forEach(sectionKey => {
            const sectionData = sectionsMap[sectionKey];
            const sectionId = sectionKey.toLowerCase().replace(/[\s\W]+/g, '-');
            
            // Fallback to an empty string if description is undefined
            const sectionDescription = sectionData.description || '';
    
            const sectionHTML = `
                <section id="${sectionId}" class="content-section">
                    <h2 class="menu-section">${sectionKey}</h2>
                    <p class="section-desc"><em>${sectionDescription}</em></p>
                    <div class="menu-items">
                        ${sectionData.items.map(item => `
                            <div class="item">
                                <div>
                                    <p class="item-name">
                                        <strong>${item.menuName}</strong><br>
                                        <em>${item.description}</em>
                                    </p>
                                    <p class="price">${item.price}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
    
            menuSectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
        });
    
        // Ensure the first section is active
        const firstSection = menuSectionsContainer.querySelector('.content-section');
        if (firstSection) {
            firstSection.classList.add('active');
        }
    }    

    // Attach click event listeners to dynamically added links
    function attachLinkEventListeners() {
        const links = document.querySelectorAll('.menu-link');

        links.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                deactivateSections();
                document.getElementById(targetId).classList.add('active');
                links.forEach(link => link.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // Deactivate all sections
    function deactivateSections() {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
    }
});
