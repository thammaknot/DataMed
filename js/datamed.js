var renderPage = function() {
    $('#signin_warning').hide();
    $('#main').show();
};

var currentPatient = null;

var renderPatientInfo = function(id) {
    console.log('ID: ' + id);
    var database = firebase.database().ref('patients/' + id);
    database.once('value', function(data) {
        var patient = data.val();
        if (!patient) {
            $('#main').append('Patient not found');
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
        saveButton.append(' Save');
        var newVisitButton = $('<button>', { type: 'button', class: 'btn btn-danger'});
        var newVisitIconSpan = $('<span>', { class: 'glyphicon glyphicon-plus' });
        newVisitButton.append(newVisitIconSpan);
        newVisitButton.append(' New visit');
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
            print('Rendering queue');
            var queue = data.val();
            if (!queue) { return; }
            var queuePanel = $('#queue');
            queuePanel.empty();
            var count = 1;
            for (var key in queue) {
                var info = queue[key];
                var patient = info.patient;
                var visit = info.visit;
                // var div = $('<div>', { style: 'border-width: 2px; border-style: solid; border-color: grey;' });
                var div = $('<div>', { class: 'panel panel-primary' });
                if (clickable) {
                    console.log('Setting clickable...');
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
                var bodyText = 'unknown';
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
        window.alert('Unable to queue empty patient/visit');
        return;
    }
    firebase.database().ref('queue/').push({
        patientId: userId,
        visitId: visitId,
        time: Date.now(),
        patient: currentPatient,
        visit: currentVisit,
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
    firebase.database().ref('patients/' + id).update(info);
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
    content += '<thead><tr><th>No.</th><th>First name</th><th>Last name</th><th>Phone</th></tr></thead>\n';
    var i = 1;
    for (var id in results) {
        var patient = results[id];
        content += '<tr>';
        content += '<td>' + i + '</td>';
        content += '<td>' + patient['first_name'] + '</td>';
        content += '<td>' + patient['last_name'] + '</td>';
        content += '<td>' + patient['phone'] + '</td>';
        content += '<td><button class="btn btn-info" onclick="location.href=\'view_patient.html?id=' + id + '\';">View</button></td>';
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
    console.log('first: ' + firstName + ', last: ' + lastName + ', phone: ' + phone);
    var criteria = {};
    if (firstName) {
        criteria['first_name'] = firstName;
    }
    if (lastName) {
        criteria['last_name'] = lastName;
    }
    if (phone) {
        criteria['phone'] = phone;
    }

    if (firstName) {
        firebase.database().ref('/patients/').orderByChild('first_name')
            .equalTo(firstName)
            .once('value', function(data) {
                var results = finishFilter(data.val(), criteria);
                renderResults(results);
            });
    } else if (lastName) {
        firebase.database().ref('/patients/').orderByChild('last_name')
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
        alert('Please enter both first and last names');
        return;
    }

    // Generate a reference to a new location and add some data using push()
    var newPostRef = firebase.database().ref('patients/').push({
        first_name: firstName,
        last_name: lastName,
        phone: phone
    });
    // Get the unique ID generated by push() by accessing its key
    var postId = newPostRef.key;
    console.log(postId);
};

$("#find_patient_form").submit(function(e) {
    e.preventDefault();
});
