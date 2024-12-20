document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyAafPPmswHXIMxrv4djdgzdFMt3svA80YU';

    // Spreadsheet IDs for each location
    const SPREADSHEET_IDS = {
        NorthCity: '1vyo2X6vHY_az1U0IQWjr0k3cvJz9v3fxxwG3lYThdrU',
        SouthCity: '1zJ_LOX5cW_FYKu0YOJzSZa48HBrEYVbg0CwGWCQZJQ4',
        Izakaya: '1aovcVzI-HPTOlPOcAsuito01X3pVqtG0hphXdibQtdY',
    };

    // Select all widget containers
    const widgets = document.querySelectorAll('.yammenu-widget-container');

    widgets.forEach(widget => {
        const city = widget.getAttribute('data-city');
        const meal = widget.getAttribute('data-meal');

        if (city && meal && SPREADSHEET_IDS[city]) {
            const spreadsheetId = SPREADSHEET_IDS[city];
            fetchData(spreadsheetId, meal, widget);
        } else {
            console.error('Invalid city or meal specified in data attributes for widget:', widget);
        }
    });

    function fetchData(spreadsheetId, meal, widget) {
        const RANGE = `${meal}!A2:F`; // Updated range to include the "Subsection" column
        const URL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${RANGE}?key=${API_KEY}`;

        fetch(URL)
            .then(response => response.json())
            .then(data => {
                if (data.values) {
                    const sectionsMap = organizeMenuData(data.values);
                    updateMenuLinks(sectionsMap, widget);
                    populateMenuSections(sectionsMap, widget);
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

    function updateMenuLinks(sectionsMap, widget) {
        const menuLinksContainer = widget.querySelector('.menu');
        menuLinksContainer.innerHTML = '';

        Object.keys(sectionsMap).forEach((sectionKey, index) => {
            const sectionId = sectionKey.toLowerCase().replace(/[\s\W]+/g, '-');
            const isActive = index === 0 ? 'active' : '';

            const linkHTML = `
                <li>
                    <a href="#${sectionId}" class="menu-link ${isActive}">${sectionKey.toLocaleUpperCase()}</a>
                </li>
            `;

            menuLinksContainer.insertAdjacentHTML('beforeend', linkHTML);
        });

        attachLinkEventListeners(widget);
    }

    function populateMenuSections(sectionsMap, widget) {
        const menuSectionsContainer = widget.querySelector('.menu-sections');
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

    function attachLinkEventListeners(widget) {
        const links = widget.querySelectorAll('.menu-link');

        links.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                deactivateSections(widget);
                widget.querySelector(`#${targetId}`).classList.add('active');
                links.forEach(link => link.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    function deactivateSections(widget) {
        const sections = widget.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
    }
});
