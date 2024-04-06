document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarMenu = document.querySelector('.navbar-collapse');

    const toggleNavbar = () => {
        if (window.innerWidth < 1024) {
            navbarMenu.classList.toggle('show');
        }
    };

    navbarToggler.addEventListener('click', toggleNavbar);

    // Ensure that the navbar is reset to hidden on larger screens if previously toggled on smaller screens
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && navbarMenu.classList.contains('show')) {
            navbarMenu.classList.remove('show');
        }
    });

    console.log("Navbar script loaded and event listeners attached.");
});