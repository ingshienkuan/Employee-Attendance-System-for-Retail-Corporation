(function() {
    emailjs.init('3XpwfvazOYiUCgR3p');
})();

document.addEventListener('DOMContentLoaded', function() {
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const emailInput = document.getElementById('email');
    const generatedOtpInput = document.getElementById('generated_otp');
    
    sendOtpBtn.addEventListener('click', generateOTP);

    function generateOTP() 
    {
        const email = emailInput.value.trim();
        
        if (!email) 
        {
            Swal.fire(
            {
                icon: 'error',
                title: 'Error',
                text: 'Please enter your email address first'
            });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        generatedOtpInput.value = otp;

        // Send OTP via EmailJS
        emailjs.send('service_289rau1', 'template_kfdw4fw', 
        {
            to_email: email,
            message: `${otp}`
        })
        .then(function(response) 
        {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'OTP has been sent to your email'
            });
            console.log('EmailJS Success:', response.status, response.text);
        }, 
        function(error) 
        {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to send OTP. Please try again.'
            });
            console.log('EmailJS Failed:', error);
        });
    }
});

function togglePasswordVisibility_1(event) 
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

function togglePasswordVisibility_2(event) 
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