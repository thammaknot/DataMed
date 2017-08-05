var renderPage = function() {
    $('#main').show();
};

var currentPatient = null;

var renderPatientInfo = function(id) {
    console.log('ID: ' + id);
    var database = firebase.database().ref('patients/' + id);
    database.once('value', function(data) {
        var patient = data.val();
        if (!patient) {
            $('#main').append(STRINGS.patient_not_found);
            return;
        }
        currentPatient = patient;
        var containerDiv = $('<div>');
        for (var key in patientKeys) {
            var dataKey = key;
            var row = $('<div>', { id: key });
            row.append(renderField(key, patientKeys[key], patient[key]));
            containerDiv.append(row);
        }
        var saveButton = $('<button>', { type: 'button', class: 'btn btn-primary'});
        var saveIconSpan = $('<span>', { class: 'glyphicon glyphicon-floppy-disk' });
        saveButton.append(saveIconSpan);
        saveButton.append(' ' + STRINGS.save);
        var newVisitButton = $('<button>', { type: 'button', class: 'btn btn-danger'});
        var newVisitIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
        newVisitButton.append(newVisitIconSpan);
        newVisitButton.append(' ' + STRINGS.new_visit);
        saveButton.click(function(patientId) {
            return function() {
                savePatientInfo(patientId);
            };
        }(id));
        newVisitButton.click(function(patientId) {
            return function() {
                createNewVisit(patientId);
            };
        }(id));
        var buttonDiv = $('<div>', {class: 'form-group'});
        buttonDiv.append(saveButton);
        buttonDiv.append(newVisitButton);
        containerDiv.append(buttonDiv);
        $('#main').append(containerDiv);
    });
};

var renderQueue = function(clickable) {
    var database = firebase.database();
    database.ref('queue/').orderByChild('time')
        .on('value', function(data) {
            var queuePanel = $('#queue');
            queuePanel.empty();
            var queue = data.val();
            if (!queue) { return; }
            var count = 1;
            for (var key in queue) {
                var info = queue[key];
                var patient = info.patient;
                var visit = info.visit;
                var div = $('<div>', { class: 'panel panel-primary' });
                if (clickable) {
                    div.click(function(queueKey, currentInfo) {
                        return function() {
                            displayFullVisit(queueKey, currentInfo);
                            renderPastVisits(currentInfo.patientId);
                        }
                    }(key, info));
                }
                var header = $('<div>', { class: 'panel-heading',
                                          text: count + '. ' + patient.first_name
                                          + ' ' + patient.last_name });
                div.append(header);
                var bodyText = 'ไม่มีรายละเอียดอาการ';
                if (visit) {
                    bodyText = visit.symptoms;
                }
                var body = $('<div>', { class: 'panel-body', text: bodyText });
                div.append(body);
                queuePanel.append(div);
                ++count;
            }
        });
};

var queuePatient = function(userId, visitId) {
    if (!currentVisit || !currentPatient) {
        window.alert(STRINGS.cannot_queue_patient);
        return;
    }
    firebase.database().ref('queue/').push({
        patientId: userId,
        visitId: visitId,
        time: Date.now(),
        patient: currentPatient,
        visit: currentVisit,
    }, function(error) {
        onQueuingComplete(error, 'new_visit');
    });
};

var createNewVisit = function(id) {
    var dateTime = new Date();
    var dateString = dateTime.getDate() + '/' + (dateTime.getMonth() + 1)
        + '/' + dateTime.getFullYear() + ' ' + dateTime.getHours()
        + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds();
    var newVisitInfo = {
        date: dateString
    };
    currentVisit = newVisitInfo;
    renderNewVisit(id, dateString);
};

var savePatientInfo = function(id) {
    var button = $('#edit_profile_button');
    var changeToEdit = false;
    var info = {};
    for (var key in patientKeys) {
        var dataKey = key;
        var value = $('#edit_' + dataKey).val();
        print('Saving ' + key);
        print(value);
        if (value) {
            info[dataKey] = value;
        }
    }
    currentPatient = info;
    firebase.database().ref('patients/' + id).update(info, onUpdateComplete);
};

var getParameterByName = function(url, name) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var renderResults = function(results) {
    var resultPanel = $('#result_panel');
    resultPanel.empty();
    var content = '<table class="table">'
    content += '<thead><tr><th>' + STRINGS.order + '</th><th>' + STRINGS.first_name + '</th><th>' + STRINGS.last_name + '</th><th>' + STRINGS.phone_number + '</th></tr></thead>\n';
    var i = 1;
    if (!results || jQuery.isEmptyObject(results)) {
        $.notify(STRINGS.no_results, { position: 'bottom left', className: 'warn' });
        return;
    }
    for (var id in results) {
        var patient = results[id];
        content += '<tr>';
        content += '<td>' + i + '</td>';
        content += '<td>' + patient['first_name'] + '</td>';
        content += '<td>' + patient['last_name'] + '</td>';
        content += '<td>' + patient['phone'] + '</td>';
        content += '<td><button class="btn btn-info" onclick="location.href=\'view_patient.html?id=' + id + '\';">' + STRINGS.view + '</button></td>';
        content += '</tr>\n';
        ++i;
    }
    content += "</table>"
    resultPanel.append(content);
};

var finishFilter = function(results, criteria) {
    var output = {};
    for (var id in results) {
        var obj = results[id];
        var match = true;
        for (var key in criteria) {
            if (obj[key] && obj[key] != criteria[key]) {
                match = false;
                break;
            }
        }
        if (match) {
            output[id] = obj;
        }
    }
    return output;
};

var findPatient = function() {
    var phone = $('#phone_number').val();
    var firstName = $('#first_name').val();
    var lastName = $('#last_name').val();
    var database = firebase.database();
    var criteria = {};
    if (firstName) {
        criteria['first_name_for_search'] = firstName.toLowerCase();
    }
    if (lastName) {
        criteria['last_name_for_search'] = lastName.toLowerCase();
    }
    if (phone) {
        criteria['phone'] = phone;
    }

    if (firstName) {
        firebase.database().ref('/patients/').orderByChild('first_name_for_search')
            .equalTo(firstName)
            .once('value', function(data) {
                var results = finishFilter(data.val(), criteria);
                renderResults(results);
            });
    } else if (lastName) {
        firebase.database().ref('/patients/').orderByChild('last_name_for_search')
            .equalTo(lastName)
            .once('value', function(data) {
                var results = finishFilter(data.val(), criteria);
                renderResults(results);
            });
    } else if (phone) {
        firebase.database().ref('/patients/').orderByChild('phone')
            .equalTo(phone)
            .once('value', function(data) {
                var results = finishFilter(data.val(), criteria);
                renderResults(results);
            });
    }
};

var addNewPatient = function() {
    var phone = $('#phone_number').val();
    var firstName = $('#first_name').val();
    var lastName = $('#last_name').val();
    if (!firstName || !lastName) {
        alert(STRINGS.enter_first_and_last_names);
        return;
    }

    // Generate a reference to a new location and add some data using push()
    var newPostRef = firebase.database().ref('patients/').push({
        first_name: firstName,
        last_name: lastName,
        first_name_for_search: firstName.toLowerCase(),
        last_name_for_search: lastName.toLowerCase(),
        phone: phone
    });
    // Get the unique ID generated by push() by accessing its key
    var postId = newPostRef.key;
    window.location.href = 'view_patient.html?id=' + postId;
};

$("#find_patient_form").submit(function(e) {
    e.preventDefault();
});
