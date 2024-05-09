
// Answer option generation
$(document).ready(function () {
    // Prepopulate program_name, course_name
    $('#program_name_select').val(programName);
    $('#course_name_select').val(courseName);
    $('#program_name_select option').each(function () {
        if ($(this).val() === programName) {
            $(this).prop('selected', true);
        }
    });
    $('#course_name_select option').each(function () {
        if ($(this).val() === courseName) {
            $(this).prop('selected', true);
        }
    });


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
        // correctAnswerSelect.append('<option value="">Select</option>'); // Add a default option

        // Retrieve the number of answer options from the data attribute
        var numAnswerOptions = $('#dynamic_fields').data('numAnswerOptions');

        if (numAnswerOptions) {
            for (var i = 1; i <= numAnswerOptions; i++) {
                i == correct_ans ? correctAnswerSelect.append('<option selected value="' + i + '">Answer Option ' + i + '</option>'):correctAnswerSelect.append('<option value="' + i + '">Answer Option ' + i + '</option>');
            }
        }
    }

    $('#nav-Solution-tab').on('shown.bs.tab', function () {
        populateCorrectAnswerOptions();
    });

    var numAnswerOptions = answerOptions.length;
    $('#num_of_fields').val(numAnswerOptions);
    $('#addFieldsBtn').trigger('click');
    for (var i = 0; i < numAnswerOptions; i++) {
        $('.textarea-' + i).val(answerOptions[i]);
    }

    // Prepopulate the correct answer dropdown
    populateCorrectAnswerOptions();
    if (correct_ans !== null) {
        $('#correctAnswerSelect').val(correct_ans);
    }
});



$(document).ready(function () {
    var formData = {};
    formData['no_of_answers'] = $('#num_of_fields').val(); 
    var answer = {};
    for (let x = 0; x < formData['no_of_answers']; x++) {
        answer['textarea-'+x] = answerOptions[x];
    }
    // Event listener for Next button
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
            console.log(`${fieldType} with ${fieldName ? `name/id ${fieldName}` : ''} changed to: ${newValue}`);
            formData[fieldName] = newValue;
        }
        console.log(formData);
    });

    // Event listener for form submission
    $('#add-question-form').submit(function (event) {
        event.preventDefault();

        // Send AJAX request to the server
        $.ajax({
            type: 'POST',
            url: editQuestionsUrl, // Replace with your actual URL
            data: JSON.stringify(formData),
            contentType: 'application/json',
            beforeSend: function (xhr, settings) {
                // Include the CSRF token in the request headers
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            },
            success: function (response) {
                console.log('Question editted successfully!');
                // Reset the form or perform any other actions
            },
            error: function (xhr, status, error) {
                console.error('Error adding question:', error);
            }
        });
    });
});

// Next and previous button event handlers

$('body').on('click', '#next-profile', function () {
    $('#nav-profile-tab').tab('show');
});
$('body').on('click', '#next-contact', function () {
    $('#nav-contact-tab').tab('show');
});
$('body').on('click', '#next-solution', function () {
    $('#nav-Solution-tab').tab('show');
});

$('body').on('click', '#prev-home', function () {
    $('#nav-home-tab').tab('show');
});
$('body').on('click', '#prev-profile', function () {
    $('#nav-profile-tab').tab('show');
});
$('body').on('click', '#prev-contact', function () {
    $('#nav-contact-tab').tab('show');
});

