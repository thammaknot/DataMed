

var displayFullVisit = function(info) {
    var mainPanel = $('#main');
    mainPanel.empty();

    var patientDiv = $('<div>',
                       { style: 'border-width: 3px;' +
                         'border-style: solid; border-color: blue;' +
                         'width: 450px; '});
    var patient = info.patient;
    for (var key in patientKeys) {
        var label = $('<p>', { text: patientKeys[key].display,
                               style: 'display: inline-block; margin-right: 10px;'});
        var value = $('<p>', { text: patient[key],
                               style: 'display: inline-block' });
        var subDiv = $('<div>');
        subDiv.append(label);
        subDiv.append(value);
        patientDiv.append(subDiv);
    }

    var visitDiv = $('<div>',
                     { style: 'border-width: 3px;' +
                       'border-style: solid; border-color: green; margin: 10px;' +
                       'width: 450px;' });
    var visit = info.visit;
    for (var key in visitKeys) {
        var label = $('<p>', { text: visitKeys[key].display,
                               style: 'display: inline-block; margin-right: 10px;'});
        var value = $('<p>', { text: visit[key],
                               style: 'display: inline-block;' });
        var subDiv = $('<div>');
        subDiv.append(label);
        subDiv.append(value);
        visitDiv.append(subDiv);
    }
    mainPanel.append(patientDiv);
    mainPanel.append(visitDiv);
};
