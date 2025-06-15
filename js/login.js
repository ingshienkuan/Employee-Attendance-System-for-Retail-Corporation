function togglePasswordVisibility(event) 
{
    const toggle = event.target;
    const input = toggle.previousElementSibling;

    if (input.type === "password") 
    {
        input.type = "text";
        toggle.innerHTML = "&#128275;";
    } 
    else 
    {
        input.type = "password";
        toggle.innerHTML = "&#128274;";
    }
}