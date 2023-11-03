document.addEventListener("DOMContentLoaded", function () {
    const lastNameInput = document.getElementById("lastNameInput");
    const firstNameInput = document.getElementById("firstNameInput");
    const clearSearchInput = document.getElementById("clearSearchInput");
    const imageContainer = document.getElementById("imageContainer");
    const enlargedView = document.getElementById("enlargedView");
    const enlargedImage = document.getElementById("enlargedImage");
    const subfolderButtons = document.getElementById("subfolderButtons");
    const sizeSlider = document.getElementById("sizeSlider");

    let selectedTags = new Set();
    let imageSizeMultiplier = parseFloat(sizeSlider.value);

    // Initialize a variable to hold a timer ID
    let resizeTimer;

    // Function to filter and display images
    const filterImages = () => {
        const lastNameSearchValue = lastNameInput.value.toLowerCase();
        const firstNameSearchValue = firstNameInput.value.toLowerCase();
        imageContainer.innerHTML = "";

        // Fetch and combine images from selected folders
        const fetchPromises = Array.from(selectedTags).map(tag => {
            return fetchImages(tag).then(images => {
                return images.map(filename => ({ tag, filename }));
            });
        });

        Promise.all(fetchPromises)
            .then(taggedImages => {
                const combinedImages = taggedImages.flat().sort((a, b) => a.filename.localeCompare(b.filename));
                combinedImages.forEach(({ tag, filename }) => {
                    const [lastName, firstName] = filename.split("_");
                    if (
                        lastName.toLowerCase().includes(lastNameSearchValue) &&
                        firstName.toLowerCase().includes(firstNameSearchValue)
                    ) {
                        const imgElement = document.createElement("img");
                        imgElement.src = `images/${tag}/${filename}`;
                        imgElement.addEventListener("click", () => {
                            showEnlargedImage(`images/${tag}/${filename}`);
                        });
                        imageContainer.appendChild(imgElement);
                    }
                });
                updateImageSize();
            });
    };

    // Function to fetch image filenames from the selected tag
    const fetchImages = async (tag) => {
        const response = await fetch(`images/${tag}/images.json`);
        const data = await response.json();
        return data.images;
    };

    // Show the enlarged image
    const showEnlargedImage = (imageSrc) => {
        enlargedImage.src = imageSrc;
        enlargedView.style.display = "flex";
    };

    // Close the enlarged image
    enlargedView.addEventListener("click", () => {
        enlargedView.style.display = "none";
    });

    // Event listener for input changes
    lastNameInput.addEventListener("input", filterImages);
    firstNameInput.addEventListener("input", filterImages);

    // Event listener for clear button
    clearSearchInput.addEventListener("click", () => {
        lastNameInput.value = "";
        firstNameInput.value = "";
        filterImages();
    });

    // Event listener for tag buttons (checkboxes)
    subfolderButtons.addEventListener("change", (event) => {
        if (event.target.classList.contains("checkbox")) {
            const selectedTag = event.target.getAttribute("data-subfolder");
            if (event.target.checked) {
                selectedTags.add(selectedTag);
            } else {
                selectedTags.delete(selectedTag);
            }
            filterImages();
        }
    });

    // Event listener for size slider with debouncing
    sizeSlider.addEventListener("input", () => {
        // Clear the previous timer
        clearTimeout(resizeTimer);

        // Set a new timer that calls the function after a delay (e.g., 300 milliseconds)
        resizeTimer = setTimeout(() => {
            imageSizeMultiplier = parseFloat(sizeSlider.value);
            updateImageSize();
        }, 300);
    });

    // Function to update image size proportionally based on the 'imageSizeMultiplier'
    const updateImageSize = () => {
        const imageElements = imageContainer.querySelectorAll("img");
        
        imageElements.forEach(imgElement => {
            const img = new Image();
            img.src = imgElement.src;
            
            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;
    
                const maxImageSize = 400; // Max size: 400px
    
                const newWidth = Math.min(originalWidth * imageSizeMultiplier, maxImageSize);
                const newHeight = (newWidth / originalWidth) * originalHeight;
    
                imgElement.style.width = `${newWidth}px`;
                imgElement.style.height = `${newHeight}px`;
            };
        });
    }

    // Initial filter
    filterImages();
});
