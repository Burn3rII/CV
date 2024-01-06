document.addEventListener('DOMContentLoaded', function () {
    const mouseTracker = document.getElementById('mouse_tracker');
    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    const easingFactor = 0.1; // Facteur d'amortissement pour le flottement
    let isMouseOverPage = true;
    let isFadingOut = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseenter', () => {
        isMouseOverPage = true;
        if (isFadingOut) {
            isFadingOut = false;
            clearTimeout(fadeOutTimeout);
        }
        // Réinitialisez la position de l'élément au centre de la page
        circleX = mouseX;
        circleY = mouseY;

        // Ajustez l'opacité de manière progressive
        fadeElementIn(mouseTracker, 1000); // 1000 millisecondes (1 seconde)
    });

    document.addEventListener('mouseleave', () => {
        isMouseOverPage = false;
        isFadingOut = true;
        // Ajustez l'opacité de manière progressive et planifiez le réglage de l'opacité à 0
        fadeElementOut(mouseTracker, 1000); // 1000 millisecondes (1 seconde)
    });

    let fadeOutTimeout = null;

    function fadeElementIn(element, duration) {
        element.style.opacity = 0;
        let startTime = null;

        function fadeIn(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            element.style.opacity = Math.min(1, elapsed / duration);
            if (elapsed < duration) {
                requestAnimationFrame(fadeIn);
            }
        }

        requestAnimationFrame(fadeIn);
    }

    function fadeElementOut(element, duration) {
        element.style.opacity = 1;
        let startTime = null;

        function fadeOut(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            element.style.opacity = 1 - Math.min(1, elapsed / duration);
            if (elapsed < duration) {
                fadeOutTimeout = setTimeout(() => {
                    if (!isMouseOverPage) {
                        element.style.opacity = 0;
                        isFadingOut = false;
                    }
                }, duration);
                requestAnimationFrame(fadeOut);
            }
        }

        requestAnimationFrame(fadeOut);
    }

    function updateCirclePosition() {
        if (isMouseOverPage) {
            const circleWidth = mouseTracker.offsetWidth;
            const circleHeight = mouseTracker.offsetHeight;

            // Calcul de la position du coin supérieur gauche de l'élément pour suivre la souris avec amortissement
            const targetX = mouseX - circleWidth / 2;
            const targetY = mouseY - circleHeight / 2 + window.scrollY; // Ajout du décalage vertical réel lié au scroll

            const dx = targetX - circleX;
            const dy = targetY - circleY;
            circleX += dx * easingFactor;
            circleY += dy * easingFactor;

            mouseTracker.style.transform = `translate(${circleX}px, ${circleY}px)`;
        }

        requestAnimationFrame(updateCirclePosition);
    }

    updateCirclePosition();
});

var languageDataUrl;

$(document).ready(function() {
    var scriptElement = document.querySelector('script.custom-script');
    languageDataUrl = scriptElement.dataset.languageDataUrl;

    // Chargement initial du contenu
    // Récupérer la langue sélectionnée depuis le localStorage, utiliser 'en'
    // par défaut si elle n'est pas définie
    const initialLanguage = localStorage.getItem('selectedLanguage') || 'en';

    // Définir la langue sélectionnée dans le sélecteur
    const languageSelector = document.getElementById('language_selector');
    languageSelector.value = initialLanguage;

    changeLanguage(initialLanguage);
});

function changeLanguage(language) {
    fetch(languageDataUrl)
        .then(response => response.json())
        .then(languageData => {
            console.log(languageData); // Vérifiez si les données JSON sont correctement chargées

            if (languageData[language]) {
                // Stocker la langue sélectionnée dans le localStorage
                localStorage.setItem('selectedLanguage', language);

                updateTexts(languageData[language]);
            }
        })
        .catch(error => console.error("Error fetching or parsing JSON:", error));
}

function updateTexts(texts) {
    document.querySelectorAll('[data_translate]').forEach(element => {
        const keyPath = element.getAttribute('data_translate').split('.'); // Divisez la chaîne en un tableau de clés
        let value = texts;

        for (const key of keyPath) {
            if (value[key]) {
                value = value[key];
            } else {
                console.error(`Key not found: ${keyPath.join('.')}`);
                return;
            }
        }

        // Create a temporary element to parse the HTML content
        const tempElement = document.createElement('div');
        tempElement.innerHTML = value;

        // Traverse through the child nodes and replace placeholders with actual elements
        replacePlaceholders(tempElement, texts);

        // Replace the content of the original element with the modified HTML
        element.innerHTML = tempElement.innerHTML;
    });

    updateTooltips(texts);
		updatePlaceholder(texts);
		updateFormValue(texts);
}

function updateTooltips(texts) {
    document.querySelectorAll('[data_translate_title]').forEach(element => {
        const key = element.getAttribute('data_translate_title');
        if (texts[key]) {
            const translatedText = texts[key];
            element.setAttribute('title', translatedText);
        }
    });
}

function updatePlaceholder(texts) {
    document.querySelectorAll('[data_translate_placeholder]').forEach(element => {
        const key = element.getAttribute('data_translate_placeholder');
        if (texts[key]) {
            const translatedText = texts[key];
            element.setAttribute('placeholder', translatedText);
        }
    });
}

function updateFormValue(texts) {
    document.querySelectorAll('[data_translate_value]').forEach(element => {
        const key = element.getAttribute('data_translate_value');
        if (texts[key]) {
            const translatedText = texts[key];
            element.setAttribute('value', translatedText);
        }
    });
}

function replacePlaceholders(element, texts) {
    element.childNodes.forEach(node => {
        if (node.nodeType === 3) { // Text node
            const text = node.nodeValue.trim();
            if (text.startsWith('<a') && text.endsWith('</a>')) {
                // If the text is wrapped in <a> tags, parse it as HTML
                const tempElement = document.createElement('div');
                tempElement.innerHTML = text;

                // Replace the placeholder with the actual link
                const link = tempElement.firstChild;

                if (link.tagName.toLowerCase() === 'a') {
                    const key = link.getAttribute('data_translate');

                    if (texts[key]) {
                        const translatedText = texts[key];
                        link.textContent = translatedText;

                        node.parentNode.replaceChild(link, node);
                    }
                }
            }
            if (text.startsWith('<span') && text.endsWith('</span>')) {
                // If the text is wrapped in <span> tags, parse it as HTML
                const tempElement = document.createElement('div');
                tempElement.innerHTML = text;

                // Replace the placeholder with the actual link
                const link = tempElement.firstChild;

                if (link.tagName.toLowerCase() === 'span') {
                    const key = link.getAttribute('data_translate');

                    if (texts[key]) {
                        const translatedText = texts[key];
                        link.textContent = translatedText;

                        node.parentNode.replaceChild(link, node);
                    }
                }
            }
        } else {
            // Recursively process child nodes
            replacePlaceholders(node, texts);
        }
    });
}
