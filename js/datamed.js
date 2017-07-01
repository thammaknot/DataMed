var renderPage = function() {
    $('#signin_warning').hide();
    $('#main').show();
};

var renderVisitOverview = function(visitId, visitInfo) {
    var output = '<div style="border-width: 2px; border-style: solid; border-color: black;">';
    output += visitInfo.date + '<br/>';
    output += visitInfo.symptoms;
    output += '</div>';
    return output;
};

var renderPastVisits = function(userId) {
    firebase.database().ref('visits/' + userId)
        .once('value', function(data) {
            var visits = data.val();
            if (!visits) { return; }
            var pastVisitsPanel = $('#past_visits');
            var pastVisitsContents = '<table>\n';
            for (var key in visits) {
                var visit = visits[key];
                pastVisitsContents += '<tr><td>';
                pastVisitsContents += renderVisitOverview(key, visit);
                pastVisitsContents += '</td></tr>';
            }
            pastVisitsContents += '</table>\n';
            pastVisitsPanel.append(pastVisitsContents);
        });
};

var currentPatient = null;
var currentVisit = null;

var renderPatientInfo = function(id) {
    var database = firebase.database().ref('patients/' + id);
    database.once('value', function(data) {
        var patient = data.val();
        if (!patient) {
            $('#main').append('Patient not found');
            return;
        }
        currentPatient = patient;
        var content = '<table>';
        for (var key in patientKeys) {
            var dataKey = key;
            content += '<tr><td>';
            content += patientKeys[key].display;
            content += '</td><td>';
            var value = '';
            if (patient[dataKey]) {
                value = patient[dataKey];
            }
            content += '<input id="edit_' + dataKey + '" type="text" value="' + value + '" disabled>';
            content += '</td></tr>\n';
        }
        content += '</table>\n';
        content += '<button id="edit_profile_button" onclick="toggleEditAndSaveInfo(' + id + ');">Edit</button>';
        content += '<button onclick="createNewVisit(' + id + ');">New Visit</button>';
        $('#main').append(content);
    });
};

var updateVisit = function(userId, visitId, queueKey) {
    var info = {};
    for (var key in visitKeys) {
        var value = $('#edit_' + key).val();
        if (value) {
            info[key] = value;
        }
    }
    currentVisit = info;
    firebase.database().ref('visits/' + userId + '/' + visitId + '/').update(info);
    if (queueKey) {
        firebase.database().ref('queue/' + queueKey + '/visit').update(info);
    }
};

var deleteVisit = function(userId, visitId) {
    firebase.database().ref('visits/' + userId + '/' + visitId + '/')
        .update({'deleted' : true});
    $('#new_visit').empty();
};

var renderNewVisit = function(userId, visitId, dateString) {
    var visitsPanel = $('#new_visit');
    visitsPanel.empty();
    var content = '<div>\n<table>\n';
    content += '<tr><td>Date</td><td>' + dateString + '</td></tr>\n';
    for (var key in visitKeys) {
        var keyInfo = visitKeys[key];
        content += '<tr><td>';
        content += keyInfo.display;
        content += '</td><td>';
        content += '<input type="text" id="edit_' + key + '">';
        content += '</td></tr>';
    }
    content += '</table>\n';
    content += '<button onclick="updateVisit(\'' + userId + '\',\'' + visitId + '\');">Update</button>';
    content += '<button onclick="queuePatient(\'' + userId + '\',\'' + visitId + '\');">Queue</button>';
    content += '<button onclick="deleteVisit(\'' + userId + '\',\'' + visitId + '\');">Delete</button>';
    content += '</div>\n';
    visitsPanel.append(content);
};

var renderQueue = function(clickable) {
    var database = firebase.database();
    database.ref('queue/').orderByChild('time')
        .on('value', function(data) {
            var queue = data.val();
            if (!queue) { return; }
            var queuePanel = $('#queue');
            queuePanel.empty();
            var count = 1;
            for (var key in queue) {
                var info = queue[key];
                var patient = info.patient;
                var visit = info.visit;
                var div = $('<div>', { style: 'border-width: 2px; border-style: solid; border-color: grey;' });
                if (clickable) {
                    console.log('Setting clickable...');
                    div.click(function(queueKey, currentInfo) {
                        return function() {
                            displayFullVisit(queueKey, currentInfo);
                        }
                    }(key, info));
                }
                var index = $('<p>', { text: count} );
                div.append(index);
                if (patient) {
                    var patientNameLabel =
                        $('<p>', { text : patient.first_name + ' ' + patient.last_name });
                    div.append(patientNameLabel);
                }
                if (visit) {
                    var symptomLabel =
                        $('<p>', { text : visit.symptoms });
                    div.append(symptomLabel);
                }
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
    var newVisitId = firebase.database().ref('visits/' + id).push(newVisitInfo).key;
    renderNewVisit(id, newVisitId, dateString);
};

var toggleEditAndSaveInfo = function(id) {
    var button = $('#edit_profile_button');
    var changeToEdit = true;
    if (button.text() == 'Edit') {
        changeToEdit = true;
    } else {
        changeToEdit = false;
    }
    button.text(changeToEdit ? 'Save' : 'Edit');
    var info = {};
    for (var key in patientKeys) {
        var dataKey = key;
        $('#edit_' + dataKey).prop('disabled', !changeToEdit);
        var value = $('#edit_' + dataKey).val();
        if (value) {
            info[dataKey] = value;
        }
    }
    if (!changeToEdit) {
        currentPatient = info;
        updatePatientInfo(id, info);
    }
};

var updatePatientInfo = function(id, info) {
    var map = {};
    map['patients/' + id + '/'] = info;
    console.log(map);
    firebase.database().ref().update(map);
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
    var content = '<table>'
    content += '<tr><td>No.</td><td>First name</td><td>Last name</td><td>Phone</td></tr>\n';
    var i = 1;
    for (var id in results) {
        var patient = results[id];
        content += '<tr>';
        content += '<td>' + i + '</td>';
        content += '<td>' + patient['first_name'] + '</td>';
        content += '<td>' + patient['last_name'] + '</td>';
        content += '<td>' + patient['phone'] + '</td>';
        content += '<td><button onclick="location.href=\'view_patient.html?id=' + id + '\';">View</button></td>';
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
