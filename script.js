document.addEventListener("DOMContentLoaded", function () {
    const lastNameInput = document.getElementById("lastNameInput");
    const firstNameInput = document.getElementById("firstNameInput");
    const clearSearchInput = document.getElementById("clearSearchInput");
    const imageContainer = document.getElementById("imageContainer");
    const enlargedView = document.getElementById("enlargedView");
    const enlargedImage = document.getElementById("enlargedImage");
    const subfolderButtons = document.getElementById("subfolderButtons");
    const sizeSlider = document.getElementById("sizeSlider");
    const fullNameInput = document.getElementById("fullNameInput");

    let selectedTags = new Set();
    let imageSizeMultiplier = parseFloat(sizeSlider.value);

    // Initialize a variable to hold a timer ID
    let resizeTimer;

    // Function to filter and display images
    const filterImages = () => {
        const fullNameSearchValue = fullNameInput.value.toLowerCase().replace(/\s/g, "_");
        imageContainer.innerHTML = "";

        // If no tags are selected, include all available tags
        const tagsToFetch = selectedTags.size > 0 ? Array.from(selectedTags) : getAllAvailableTags();

        // Fetch and combine images from selected folders
        const fetchPromises = tagsToFetch.map(tag => {
            return fetchImages(tag).then(images => {
                return images.map(filename => ({ tag, filename }));
            });
        });

        Promise.all(fetchPromises)
            .then(taggedImages => {
                const combinedImages = taggedImages.flat().sort((a, b) => a.filename.localeCompare(b.filename));
combinedImages.forEach(({ tag, filename }) => {
    const nameParts = filename.split("_");
    const lastName = nameParts.pop(); // Get the last part as the last name
    const firstName = nameParts.join("_"); // Join the remaining parts as the first name

    const reversedFullName = `${lastName}_${firstName}`;
    const searchWords = fullNameSearchValue.replace(/[^\w\s]/g, "").split("_");

    // Remove punctuation from the reversed full name for comparison
    const reversedFullNameWithoutPunctuation = reversedFullName.replace(/[^\w\s]/g, "");

    // Check if each search word is present in the reversed full name without punctuation
    const isMatch = searchWords.every(word =>
        reversedFullNameWithoutPunctuation.toLowerCase().includes(word.toLowerCase())
    );

    if (isMatch) {
        // Display the image if all search words are present in the reversed full name
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

    fullNameInput.addEventListener("input", filterImages);

    // ... (rest of the code)

// Function to fetch all available tags
const getAllAvailableTags = () => {
    // Modify this to return an array of all available tags
    // For example, if you have a predefined list, you can return that list
    // If your tags are dynamic, you might need to fetch them from the server or another source
    return ["2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"]; // Replace with your actual tags
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
    fullNameInput.addEventListener("input", filterImages);

    // Event listener for clear button
    clearSearchInput.addEventListener("click", () => {
        fullNameInput.value = "";
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




//MOBILE SLIDER

        // Function to set the step attribute based on the device
        function setStep() {
            var sizeSlider = document.getElementById("sizeSlider");
            if (window.innerWidth < 768) {
                // Set a smaller step for mobile devices
                sizeSlider.step = "0.1";
                sizeSlider.max = "0.6";
            } else {
                // Set the default step for other devices
                sizeSlider.step = "0.01";
            }
        }

        // Add an event listener to adjust the step when the window is resized
        window.addEventListener("resize", setStep);

        // Initial call to set the step attribute
        window.addEventListener("load", setStep);

