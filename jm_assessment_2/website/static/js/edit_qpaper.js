var formData = {};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

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

$('body').on('change', 'input[type="number"], input[type="text"], input[type="date"], input[type="time"], select', function () {
    const fieldType = $(this).prop('nodeName').toLowerCase();
    const fieldName = $(this).attr('name') || $(this).attr('id');
    const newValue = $(this).val();

    console.log(`${fieldType} with ${fieldName ? `name/id ${fieldName}` : ''} changed to: ${newValue}`);
    formData[fieldName] = newValue;

    console.log(formData);
});

$('body').on('click', '#nav-home-tab', function () {
    $('#nav-profile-tab').tab('show');
    $.ajax({
        url: '/edit_qpaper/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({
            'program': formData['program_name'],
            'course': formData['course_name'],
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            if (response.length != 0) {
                var tableHTML = '<table class="table table-striped"><thead><tr><th>Que ID</th><th>Ques Text</th><th>Complexity</th><th>Program</th><th>Course</th><th>Choose</th></tr></thead>'
                tableHTML += '<tbody>';
                for (let i = 0; i < response.length; i++) {
                    let record = response[i];
                    tableHTML += '<tr>';
                    for (let key in record) {
                        tableHTML += '<td>' + record[key] + '</td>';
                        if (key == 'Course') {
                            tableHTML += '<td><input class="form-check-input" type="checkbox" name="selected-questions" value="' + record['ID'] + '"></td>';
                        }
                    }
                    tableHTML += '</tr>';
                }
                tableHTML += '</tbody></table>';
                $('#table-questions').html(tableHTML);
            }
            else {
                $('#table-questions').html('<h6>No Questions present for the selected Program and Course.</h6>');
                $('#submit-qpaper').addClass('disabled');
            }


        },
        error: function (xhr, errmsg, err) {
            // Handle errors that occur during the AJAX request
        }
    });
});

$('body').on('click', '#nav-profile-tab', function () {
    $('#nav-home-tab').tab('show');
});

$('body').on('click', '#submit-qpaper', function () {
    const selectedQuestions = $('input[name="selected-questions"]:checked').map(function () {
        return parseInt($(this).val());
    }).get();
    var q_count = Math.floor(parseInt(formData['total_marks']) / parseInt(formData['per-q-marks']));
    formData['q_count'] = q_count;
    console.log(q_count);
    if (selectedQuestions.length === 0) {
        alert('Please select at least one question.');
        return;
    }
    else if (selectedQuestions.length > q_count) {
        alert('Total marks and marks for each question implies that you can only have ' + q_count + ' number of questions.');
        return;
    }
    formData['question_ids'] = selectedQuestions;

    // Send the selected question IDs to your view
    $.ajax({
        url: '/submit_qpaper/', // Replace with your view URL
        type: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({
            'program': formData['program_name'],
            'course': formData['course_name'],
            'qpaper_name': formData['qpaper_name'],
            'semester': formData['semester'],
            'institute_name': formData['institute_name'],
            'exam_date': formData['exam_date'],
            'marks_for_each': parseInt(formData['per-q-marks']),
            'q_count': formData['q_count'],
            'total_marks': parseInt(formData['total_marks']),
            'exam_duration': formData['exam_duration'],
            'status': formData['status'],
            'question_ids': selectedQuestions,
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            console.log(response);
        },
        error: function (xhr, errmsg, err) {
            // Handle errors that occur during the AJAX request
        }
    });
});

const $parentElement = $('#table-questions');

function performFunction($checkbox, isChecked) {
    console.log(`Checkbox with value ${$checkbox.val()} is ${isChecked ? 'checked' : 'unchecked'}`);
    let per_q_marks = parseInt(formData['per-q-marks']);
    if (per_q_marks == '') {
        alert();
    }
    let current_marks = parseInt($('#total_marks').val());
    if (isChecked && $('#total_marks').val() == '') {
        $('#total_marks').val(per_q_marks);
    }
    else if (isChecked) {
        $('#total_marks').val(current_marks + per_q_marks);
    }
    else if (!isChecked) {
        $('#total_marks').val(current_marks - per_q_marks);
    }
    formData['total_marks'] = $('#total_marks').val()
}

$parentElement.on('change', 'input[type="checkbox"]', function () {
    const $checkbox = $(this);
    const isChecked = $checkbox.is(':checked');

    performFunction($checkbox, isChecked);
});
