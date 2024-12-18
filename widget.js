document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyAafPPmswHXIMxrv4djdgzdFMt3svA80YU';

    // Spreadsheet IDs for each location
    const SPREADSHEET_IDS = {
        NorthCity: '1vyo2X6vHY_az1U0IQWjr0k3cvJz9v3fxxwG3lYThdrU',
        SouthCity: '1bXyZ6vXYZ_someOtherSpreadsheetId',
        Izakaya: '1cAbC6vHIJ_anotherSpreadsheetId',
    };

    const widget = document.getElementById('yammenu-widget-container');
    const city = widget.getAttribute('data-city');
    const meal = widget.getAttribute('data-meal');

    if (city && meal && SPREADSHEET_IDS[city]) {
        const spreadsheetId = SPREADSHEET_IDS[city];
        fetchData(spreadsheetId, meal);
    } else {
        console.error('Invalid city or meal specified in data attributes.');
    }

    function fetchData(spreadsheetId, meal) {
        const RANGE = `${meal}!A2:F`; // Updated range to include the "Subsection" column
        const URL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${RANGE}?key=${API_KEY}`;

        fetch(URL)
            .then(response => response.json())
            .then(data => {
                if (data.values) {
                    const sectionsMap = organizeMenuData(data.values);
                    updateMenuLinks(sectionsMap);
                    populateMenuSections(sectionsMap);
                } else {
                    console.error('No data found for the specified meal and spreadsheet.');
                }
            })
            .catch(error => console.error('Error fetching menu data:', error));
    }

    function organizeMenuData(data) {
        const sectionsMap = {};
    
        data.forEach(row => {
            const [menuName, description, price, section, sectionDescription, subsection] = row;
    
            if (!sectionsMap[section]) {
                sectionsMap[section] = {
                    description: sectionDescription || '',
                    subsections: {},
                };
            }
    
            // Use an empty string as a fallback if subsection is undefined or blank
            const validSubsection = subsection ? subsection : '';
    
            if (!sectionsMap[section].subsections[validSubsection]) {
                sectionsMap[section].subsections[validSubsection] = [];
            }
    
            sectionsMap[section].subsections[validSubsection].push({
                menuName,
                description,
                price,
            });
        });
    
        return sectionsMap;
    }
    

    function updateMenuLinks(sectionsMap) {
        const menuLinksContainer = document.querySelector('.menu');
        menuLinksContainer.innerHTML = '';

        Object.keys(sectionsMap).forEach((sectionKey, index) => {
            const sectionId = sectionKey.toLowerCase().replace(/[\s\W]+/g, '-');
            const isActive = index === 0 ? 'active' : '';

            const linkHTML = `
                <li>
                    <a href="#${sectionId}" class="menu-link ${isActive}">${sectionKey}</a>
                </li>
            `;

            menuLinksContainer.insertAdjacentHTML('beforeend', linkHTML);
        });

        attachLinkEventListeners();
    }

    function populateMenuSections(sectionsMap) {
        const menuSectionsContainer = document.querySelector('.menu-sections');
        menuSectionsContainer.innerHTML = '';
    
        Object.keys(sectionsMap).forEach(sectionKey => {
            const sectionData = sectionsMap[sectionKey];
            const sectionId = sectionKey.toLowerCase().replace(/[\s\W]+/g, '-');
            const sectionDescription = sectionData.description || '';
    
            let subsectionsHTML = '';
            Object.keys(sectionData.subsections).forEach(subsectionKey => {
                const itemsHTML = sectionData.subsections[subsectionKey]
                    .map(item => `
                        <div class="item">
                            <div>
                                <p class="item-name">
                                    <strong>${item.menuName}</strong><br>
                                    <em>${item.description}</em>
                                </p>
                                <p class="price">${item.price}</p>
                            </div>
                        </div>
                    `).join('');
    
                // Only display the subsection title if it is not empty
                const subsectionTitleHTML = subsectionKey ? `<h3 class="subsection-title">${subsectionKey}</h3>` : '';
    
                subsectionsHTML += `
                    <div class="subsection">
                        ${subsectionTitleHTML}
                        <div class="menu-items">${itemsHTML}</div>
                    </div>
                `;
            });
    
            const sectionHTML = `
                <section id="${sectionId}" class="content-section">
                    <h2 class="menu-section">${sectionKey}</h2>
                    <p class="section-desc"><em>${sectionDescription}</em></p>
                    ${subsectionsHTML}
                </section>
            `;
    
            menuSectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
        });
    
        const firstSection = menuSectionsContainer.querySelector('.content-section');
        if (firstSection) {
            firstSection.classList.add('active');
        }
    }
    

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

    function deactivateSections() {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
    }
});
