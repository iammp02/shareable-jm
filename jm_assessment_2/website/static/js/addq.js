// Handle enter keypress which submits the form
$('#add-question-form').on('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Initially disable the Next button
// $('.next-tab').prop('disabled', true);


// Answer option generation
$(document).ready(function () {
    $('#addFieldsBtn').on('click', function () {
        var numFields = $('#num_of_fields').val();
        var dynamicFieldsHTML = '';
        for (var i = 0; i < numFields; i++) {
            dynamicFieldsHTML += '<div class="mb-3 animated-field"><hr><h6>Answer Option ' + (i + 1) + '</h6></div>';
            dynamicFieldsHTML += '<div class="mb-3 animated-field row"><label for="inputPassword" class="col-sm-3 col-form-label text-end">Answer Text:</label>';
            dynamicFieldsHTML += '<div class="col-sm-9"><textarea class="form-control textarea-' + i + '" id="answer_options" rows="5"></textarea></div></div>';
        }
        $('#dynamic_fields').html(dynamicFieldsHTML);
        $('#dynamic_fields').data('numAnswerOptions', numFields);
    });
    function populateCorrectAnswerOptions() {
        var correctAnswerSelect = $('#correctAnswerSelect');
        correctAnswerSelect.empty(); // Clear existing options
        correctAnswerSelect.append('<option value="">Select</option>'); // Add a default option

        // Retrieve the number of answer options from the data attribute
        var numAnswerOptions = $('#dynamic_fields').data('numAnswerOptions');

        if (numAnswerOptions) {
            for (var i = 1; i <= numAnswerOptions; i++) {
                correctAnswerSelect.append('<option value="' + i + '">Answer Option ' + i + '</option>');
            }
        }
    }

    $('#nav-Solution-tab').on('shown.bs.tab', function () {
        populateCorrectAnswerOptions();
    });
});



$(document).ready(function () {
    var formData = {};
    var answer = {};
    // function for checking fields status
    function validateCurrentStep() {
        var currentTab = $('.nav-link.active').attr('id');
        var isValid = true;

        switch (currentTab) {
            case 'nav-home-tab':
                var requiredFields = ['program_name', 'course_name', 'status'];
                isValid = requiredFields.every(function (field) {
                    return formData[field] !== undefined && formData[field] !== '' && formData[field] !== 'Select';
                });
                break;
            case 'nav-profile-tab':
                var requiredFields = ['complexity', 'question_type', 'question_text'];
                isValid = requiredFields.every(function (field) {
                    return formData[field] !== undefined && formData[field] !== '' && formData[field] !== 'Select';
                });
                break;
            case 'nav-contact-tab':
                var requiredFields = ['answer_type', 'no_of_answers'];
                isValid = requiredFields.every(function (field) {
                    return formData[field] !== undefined && formData[field] !== '' && formData[field] !== 'Select';
                });
                if (isValid && formData['no_of_answers']) {
                    isValid = Object.keys(formData['answer']).length === parseInt(formData['no_of_answers']);
                }
                break;
            case 'nav-Solution-tab':
                var requiredFields = ['answer_text', 'correct_ans'];
                isValid = requiredFields.every(function (field) {
                    return formData[field] !== undefined && formData[field] !== '';
                });
                break;
            default:
                isValid = false;
        }

        return isValid;
    }

    // followup function for disabling the next button if the fields are not filled
    function updateNextButtonState() {
        var isValid = validateCurrentStep();
        $('.next-tab').prop('disabled', !isValid);
    }

    // Attach the event listener to all select dropdowns and textareas
    $('body').on('change', 'input[type="number"], select, textarea', function () {
        const fieldType = $(this).prop('nodeName').toLowerCase();
        const fieldName = $(this).attr('name') || $(this).attr('id');
        const tFieldClass = $(this).attr('class').split(' ')[1];
        const newValue = $(this).val();

        if (fieldName == 'no_of_answers') {
            formData.answer = {};
        }


        if (fieldName == "answer_options" && ((Object.keys(answer).length < formData['no_of_answers']) || tFieldClass in answer)) {
            answer[tFieldClass] = newValue;
            formData['answer'] = answer;
        }
        else {
            // console.log(`${fieldType} with ${fieldName ? `name/id ${fieldName}` : ''} changed to: ${newValue}`);
            formData[fieldName] = newValue;
        }
        updateNextButtonState();
        console.log(formData);
    });

    // Event listener for form submission
    $('#add-question-form').submit(function (event) {
        event.preventDefault();

        // Send AJAX request to the server
        $.ajax({
            type: 'POST',
            url: addQuestionsUrl, // Replace with your actual URL
            data: JSON.stringify(formData),
            contentType: 'application/json',
            beforeSend: function (xhr, settings) {
                // Include the CSRF token in the request headers
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            },
            success: function (response) {
                var alertDiv = $('<div class="alert alert-success alert-dismissible fade in show" role="alert">');
                alertDiv.text('Question added successfully!');
                var dismissButton = $('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>');
                alertDiv.append(dismissButton);
                // $('#add-question-form').before(alertDiv);
                $('#alert-container').html(alertDiv).addClass('show');;

                // $('#add-question-form')[0].reset();
                // setTimeout(function () {
                //     window.location.href = '/dashboard/';
                // }, 3000);
                $('#add-question-form')[0].reset();
                var remainingSeconds = 4; // Example remaining seconds
                var countdownInterval = setInterval(function () {
                    remainingSeconds--;
                    if (remainingSeconds <= 0) {
                        clearInterval(countdownInterval);
                        window.location.href = '/dashboard/'; // Redirect to the dashboard after countdown completes
                    } else {
                        alertDiv.text('Question added successfully! Redirecting to dashboard in ' + remainingSeconds + ' seconds...');
                    }
                }, 1000);

            },
            error: function (xhr, status, error) {
                console.error('Error adding question:', error);
            }
        });
    });
    // Next and previous button event handlers

    $('body').on('click', '#next-profile', function () {
        $('#nav-profile-tab').tab('show');
        updateNextButtonState();
    });
    $('body').on('click', '#next-contact', function () {
        $('#nav-contact-tab').tab('show');
        updateNextButtonState();
    });
    $('body').on('click', '#next-solution', function () {
        $('#nav-Solution-tab').tab('show');
        updateNextButtonState();
    });

    $('body').on('click', '#prev-home', function () {
        $('#nav-home-tab').tab('show');
        updateNextButtonState();
    });
    $('body').on('click', '#prev-profile', function () {
        $('#nav-profile-tab').tab('show');
        updateNextButtonState();
    });
    $('body').on('click', '#prev-contact', function () {
        $('#nav-contact-tab').tab('show');
        updateNextButtonState();
    });
});

