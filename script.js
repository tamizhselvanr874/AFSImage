let isGenerating = false;  
  
// Function to toggle the sidebar  
function toggleSidebar() {  
    document.getElementById("sidebar").classList.toggle("active");  
}  
  
// Event listener for the submit button in the prompt field  
document.getElementById("submit").addEventListener("click", () => {  
    if (!isGenerating) {  
        generateImage();  
    }  
});  
  
// --------------------------------  
async function generateImage() {  
    const prompt = document.getElementById("promptInput").value;  
    const style = document.querySelector("#field1 .icon-btn.active")?.id || "";  
    const quality = document.querySelector("#field2 .icon-btn.active")?.id || "";  
    const size = document.querySelector("#field3 .icon-btn.active")?.id || "";  
  
    if (prompt.trim() === "") {  
        alert("Please enter an image description.");  
        return;  
    }  
  
    const imageContainerCard1 = document.querySelector("#card1 .card1-image-container");  
    const loadingSpinnerCard1 = document.createElement("div");  
    loadingSpinnerCard1.className = "unique-loading-spinner";  
    imageContainerCard1.innerHTML = "";  
    imageContainerCard1.appendChild(loadingSpinnerCard1);  
  
    const imageContainerCard2 = document.querySelector("#card2 .card2-image-container"); // No loading spinner for card2; it retains the previous image  
  
    const retryCount = 3; // Number of retries  
    const initialDelay = 1000; // Initial delay in milliseconds  
  
    async function fetchImageWithRetry(currentRetry = 0) {  
        isGenerating = true; // Set flag to true to prevent multiple requests  
        try {  
            const response = await fetch("https://dall-ts.azurewebsites.net/api/httpTriggerts", {  
                method: "POST",  
                headers: {  
                    "Content-Type": "application/json",  
                },  
                body: JSON.stringify({ prompt, style, quality, size })  
            });  
  
            if (!response.ok) {  
                throw new Error("Network response was not ok");  
            }  
  
            const data = await response.json();  
  
            if (data.imageUrls) {  
                const url = data.imageUrls[0];  
                await handleImageLoad(url, prompt, size, imageContainerCard1, imageContainerCard2, loadingSpinnerCard1);  
                isGenerating = false; // Reset flag after successful image load  
            } else {  
                handleImageError(imageContainerCard1, loadingSpinnerCard1);  
                isGenerating = false; // Reset flag on error  
            }  
        } catch (error) {  
            console.error("Error generating image:", error);  
            if (currentRetry < retryCount) {  
                const delay = initialDelay * Math.pow(2, currentRetry);  
                setTimeout(() => fetchImageWithRetry(currentRetry + 1), delay);  
            } else {  
                handleImageError(imageContainerCard1, loadingSpinnerCard1, true);  
                isGenerating = false; // Reset flag after retries  
            }  
        }  
    }  
  
    // Initial fetch attempt  
    fetchImageWithRetry();  
}  
  
async function handleImageLoad(url, prompt, size, imageContainerCard1, imageContainerCard2, loadingSpinnerCard1) {  
    const imgCard1 = new Image();  
    const imgCard2 = new Image();  
    imgCard1.src = url;  
    imgCard2.src = url;  
    imgCard1.alt = prompt;  
    imgCard2.alt = prompt;  
    imgCard1.classList.add("card1-image");  
    imgCard2.classList.add("card2-image");  
  
    imgCard1.onload = () => {  
        loadingSpinnerCard1.remove();  
        imageContainerCard1.innerHTML = ""; // Clear loading spinner  
        imageContainerCard1.appendChild(imgCard1);  
        appendButtons();  
        recycleButton.disabled = false;  
        deleteButton.disabled = false;  
        currentImageUrl = imgCard1.src; // Store the current image URL  
  
        // Load image in card2 after imgCard1 is loaded  
        imageContainerCard2.innerHTML = ""; // Clear previous image  
        imageContainerCard2.appendChild(imgCard2);  
        appendCard3Buttons();  
        updateCarouselImages(url); // Update the carousel images with the new image URL  
    };  
  
    imgCard1.onerror = imgCard2.onerror = () => {  
        handleImageError(imageContainerCard1, loadingSpinnerCard1);  
    };  
}  
  
function getImageDimensions(size) {  
    switch (size) {  
        case "Desktop":  
            return { width: 1600, height: 900 };  
        case "Website":  
            return { width: 1800, height: 600 };  
        case "Portrait":  
            return { width: 1080, height: 1920 };  
        case "Landscape":  
            return { width: 1920, height: 1080 };  
        default:  
            return { width: 0, height: 0 };  
    }  
}  
  
function handleImageError(imageContainerCard1, loadingSpinnerCard1, isRetryExceeded = false) {  
    loadingSpinnerCard1.remove();  
    imageContainerCard1.innerHTML = `  
        <span style="  
            color: #45474B;  
            font-weight: bold;  
            font-size: 60px;  
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);  
            background: -webkit-linear-gradient(#45474B, #6B6E73);  
            -webkit-background-clip: text;  
            -webkit-text-fill-color: transparent;  
        ">  
            ${isRetryExceeded ? 'Failed to generate image after retries. Please try again later...' : 'Failed to generate image. Please try again...'}  
        </span>`;  
}  
  
// ----------------------------------------------  
// Function to resize image  
function resizeImage(url, width, height) {  
    return new Promise((resolve, reject) => {  
        const img = new Image();  
        img.crossOrigin = "anonymous";  
        img.onload = () => {  
            const canvas = document.createElement("canvas");  
            const ctx = canvas.getContext("2d");  
  
            canvas.width = width;  
            canvas.height = height;  
  
            ctx.drawImage(img, 0, 0, width, height);  
  
            canvas.toBlob(blob => {  
                const reader = new FileReader();  
                reader.onload = () => {  
                    resolve(reader.result);  
                };  
                reader.readAsDataURL(blob);  
            }, "image/png");  
        };  
        img.onerror = reject;  
        img.src = url;  
    });  
}  
  
// Select the buttons  
const recycleButton = document.getElementById('downloadButtonCard1');  
const deleteButton = document.getElementById('deleteButtonCard1');  
const downloadButton = document.getElementById('recycleButtonCard1');  
const generate = document.getElementById('submit');  
  
const leftArrowButtonCard3 = document.getElementById('leftArrowButtonCard2');  
const rightArrowButtonCard3 = document.getElementById('rightArrowButtonCard2');  
const copyButtonCard3 = document.getElementById('downloadButtonCard2');  
const deleteButtonCard3 = document.getElementById('deleteButtonCard2');  
const downloadButtonCard3 = document.getElementById('copyButtonCard2');  
  
const card3ImageContainer = document.querySelector('.card2-image-container');  
let card3Images = [];  
let currentCard3ImageIndex = 0;  
  
// Initially disable the recycle and delete buttons  
recycleButton.disabled = true;  
deleteButton.disabled = true;  
  
let currentImageUrl = ""; // Store the current generated image URL  
  
// Ensure buttons are positioned on top of the image  
function appendButtons() {  
    const imageContainer = document.querySelector("#card1 .card1-image-container");  
    imageContainer.appendChild(recycleButton);  
    imageContainer.appendChild(deleteButton);  
    imageContainer.appendChild(downloadButton);  
}  
  
// Ensure buttons are positioned on top of the image in Card 3  
function appendCard3Buttons() {  
    const card3ImageContainer = document.querySelector(".card2-image-container");  
    card3ImageContainer.appendChild(leftArrowButtonCard3);  
    card3ImageContainer.appendChild(rightArrowButtonCard3);  
    card3ImageContainer.appendChild(copyButtonCard3);  
    card3ImageContainer.appendChild(deleteButtonCard3);  
    card3ImageContainer.appendChild(downloadButtonCard3);  
}  
  
// Event listener for the icon buttons to toggle active class  
document.querySelectorAll(".icon-btn").forEach(button => {  
    button.addEventListener("click", function () {  
        const buttons = this.closest(".field").querySelectorAll(".icon-btn");  
        buttons.forEach(btn => btn.classList.remove("active"));  
        this.classList.add("active");  
    });  
});  
  
// Event listener for the download button in Card 2  
downloadButton.addEventListener('click', async () => {  
    if (currentImageUrl) {  
        const size = document.querySelector("#field3 .icon-btn.active")?.id || "";  
        const dimensions = getImageDimensions(size);  
        const resizedUrl = await resizeImage(currentImageUrl, dimensions.width, dimensions.height);  
          
        const link = document.createElement('a');  
        link.href = resizedUrl;  
        link.download = 'generated_image.png'; // You can change the default download name  
        link.target = '_blank'; // Open in a new tab  
        link.click();  
    } else {  
        alert("No image to download.");  
    }  
});  
  
// Event listener for the delete button in Card 2  
deleteButton.addEventListener('click', () => {  
    const imageContainer = document.querySelector("#card1 .card1-image-container");  
    imageContainer.innerHTML = ""; // Clear the current image  
    const sampleImage = new Image();  
    sampleImage.src = "image1.png"; // Path to the sample image  
    sampleImage.alt = "Sample Image";  
    sampleImage.classList.add("card2-image");  
    imageContainer.appendChild(sampleImage);  
    appendButtons(); // Re-append the buttons  
    currentImageUrl = ""; // Clear the current image URL  
});  
  
// Event listener for the recycle button in Card 2  
recycleButton.addEventListener('click', () => {  
    if (currentImageUrl && !isGenerating) {  
        const card3Image = new Image();  
        card3Image.src = currentImageUrl;  
        card3Image.alt = "Previously Generated Image";  
        card3Image.classList.add("card2-image");  
  
        card3Images.unshift(card3Image);  
        displayCard3Image(0);  
        generateImage();  
        card3ImageContainer.scrollTop = 0; // Scroll to the top  
    } else if (!currentImageUrl) {  
        alert("No image to regenerate.");  
    }  
});  
  
// Event listener for the main generate button  
generate.addEventListener('click', () => {  
    if (currentImageUrl && !isGenerating) {  
        const card2Image = new Image();  
        card2Image.src = currentImageUrl;  
        card2Image.alt = "Previously Generated Image";  
        card2Image.classList.add("card2-image");  
  
        card3Images.unshift(card2Image);  
        displayCard3Image(0);  
    }  
    if (!isGenerating) {  
        generateImage();  
    }  
    card3ImageContainer.scrollTop = 0; // Scroll to the top  
});  
  
// Event listener for the left arrow button in Card 3  
leftArrowButtonCard3.addEventListener('click', () => {  
    if (card3Images.length > 0) {  
        currentCard3ImageIndex = (currentCard3ImageIndex - 1 + card3Images.length) % card3Images.length;  
        displayCard3Image(currentCard3ImageIndex);  
    }  
});  
  
// Event listener for the right arrow button in Card 3  
rightArrowButtonCard3.addEventListener('click', () => {  
    if (card3Images.length > 0) {  
        currentCard3ImageIndex = (currentCard3ImageIndex + 1) % card3Images.length;  
        displayCard3Image(currentCard3ImageIndex);  
    }  
});  
  
// Function to display image in Card 3 based on the index  
function displayCard3Image(index) {  
    card3ImageContainer.innerHTML = "";  
    if (card3Images.length > 0) {  
        const img = card3Images[index];  
        card3ImageContainer.appendChild(img);  
        appendCard3Buttons();  
    } else {  
        const sampleImage = new Image();  
        sampleImage.src = "image2.png"; // Path to the default image  
        sampleImage.alt = "Sample Image";  
        sampleImage.classList.add("card2-image");  
        card3ImageContainer.appendChild(sampleImage);  
        appendCard3Buttons();  
    }  
}  
  
// Event listener for the download button in Card 3  
downloadButtonCard3.addEventListener('click', () => {  
    if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {  
        const link = document.createElement('a');  
        link.href = card3Images[currentCard3ImageIndex].src;  
        link.download = 'generated_image.png';  
        link.target = '_blank';  
        link.click();  
    } else {  
        alert("No image to download.");  
    }  
});  
  
// Event listener for the delete button in Card 3  
deleteButtonCard3.addEventListener('click', () => {  
    if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {  
        card3Images.splice(currentCard3ImageIndex, 1);  
        currentCard3ImageIndex = Math.min(currentCard3ImageIndex, card3Images.length - 1);  
        displayCard3Image(currentCard3ImageIndex);  
    } else {  
        alert("No image to delete.");  
    }  
});  
  
// Event listener for the copy prompt button in Card 3  
copyButtonCard3.addEventListener('click', () => {  
    const promptText = document.getElementById('promptInput').value;  
    if (promptText.trim() !== "") {  
        navigator.clipboard.writeText(promptText)  
            .then(() => alert("Prompt copied to clipboard successfully!"))  
            .catch(err => console.error("Error copying prompt:", err));  
    } else {  
        alert("No prompt text to copy.");  
    }  
});  
  
// Toggle active class for icon buttons  
function toggleActive(button, group) {  
    const groupMap = {  
        style: 1,  
        quality: 2,  
        size: 3,  
        guide: 4  
    };  
  
    const buttons = document.querySelectorAll(`#field${groupMap[group]} .icon-btn`);  
    buttons.forEach(btn => {  
        if (btn !== button) {  
            btn.classList.remove('active');  
        }  
    });  
  
    if (button.classList.contains('active')) {  
        button.classList.remove('active');  
    } else {  
        button.classList.add('active');  
    }  
}  
  
// Event listener for the Enter key in the prompt input field  
document.getElementById('promptInput').addEventListener('keydown', function (event) {  
    if (event.key === 'Enter' && !isGenerating) {  
        document.getElementById('submit').click();  
    }  
});  
  
// Function to update the carousel images array  
function updateCarouselImages(url) {  
    const card3Image = new Image();  
    card3Image.src = url;  
    card3Image.alt = "Generated Image";  
    card3Image.classList.add("card2-image");  
  
    card3Images.unshift(card3Image);  
    currentCard3ImageIndex = 0;  
    displayCard3Image(currentCard3ImageIndex);  
}  
