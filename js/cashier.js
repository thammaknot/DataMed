var renderTreatmentQueue = function() {
    var database = firebase.database();
    database.ref('treatment-queue/').orderByChild('time')
        .on('value', function(data) {
            var queuePanel = $('#treatment_queue');
            queuePanel.empty();
            var queue = data.val();
            if (!queue) { return; }
            var count = 1;
            for (var key in queue) {
                var info = queue[key];
                var patient = info.patient;
                var visit = info.visit;
                var div = $('<div>', { class: 'panel panel-success' });
                var header = $('<div>', { class: 'panel-heading',
                                          text: count + '. ' + patient.first_name
                                          + ' ' + patient.last_name });
                div.append(header);
                var symptomSpan = $('<span>', { class: 'label label-primary'}).text(visit.symptoms);
                var treatmentSpan = $('<span>', { class: 'label label-success' }).text(getTreatmentString(visit));
                var doneButton = $('<button>', { class: 'btn btn-success' });
                var doneIconSpan = $('<span>', { class: 'glyphicon glyphicon-ok' });
                doneButton.append(doneIconSpan);
                doneButton.click(function(queueKey, queueInfo) {
                    return function() {
                        removeFromTreatmentQueue(queueKey, queueInfo);
                        addToPaymentQueue(queueKey, queueInfo);
                    };
                }(key, info));
                var body = $('<div>', { class: 'panel-body'});
                body.append(symptomSpan);
                body.append(treatmentSpan);
                body.append(doneButton);
                div.append(body);
                queuePanel.append(div);
                ++count;
            }
        });
};

var getTreatmentString = function(visitInfo) {
    var output = '';
    var treatments = visitInfo.treatments;
    var delim = '';
    for (var treatment in treatments) {
        output += delim + treatment;
        delim = ',';
    }
    return output;
};

var removeFromTreatmentQueue = function(queueKey, queueInfo) {
    var treatmentQueuePanel = $('#treatment_queue');
    firebase.database().ref('treatment-queue/' + queueKey).remove();
};

var addToPaymentQueue = function(queueKey, queueInfo) {
    firebase.database().ref('payment-queue/' + queueKey).update(queueInfo);
};

var renderPaymentQueue = function() {
    var database = firebase.database();
    database.ref('payment-queue/').orderByChild('time')
        .on('value', function(data) {
            var queuePanel = $('#payment_queue');
            queuePanel.empty();
            var queue = data.val();
            if (!queue) { return; }
            var count = 1;
            for (var key in queue) {
                var info = queue[key];
                var patient = info.patient;
                var visit = info.visit;
                var div = $('<div>', { class: 'panel panel-success' });
                var header = $('<div>', { class: 'panel-heading',
                                          text: count + '. ' + patient.first_name
                                          + ' ' + patient.last_name });
                div.append(header);
                var symptomSpan = $('<span>', { class: 'label label-primary'}).text(visit.symptoms);
                var prescriptionDiv = renderPrescription(visit);
                var costString = (visit.cost ? visit.cost : '0') + ' Baht';
                var paymentSpan = $('<span>', { class: 'label label-danger' }).text(costString);
                var doneButton = $('<button>', { class: 'btn btn-success' });
                var doneIconSpan = $('<span>', { class: 'glyphicon glyphicon-ok' });
                var moneyIconSpan = $('<span>', { class: 'glyphicon glyphicon-bitcoin' });
                doneButton.append(moneyIconSpan);
                doneButton.append(doneIconSpan);
                doneButton.click(function(queueKey, queueInfo) {
                    return function() {
                        removeFromPaymentQueue(queueKey);
                    };
                }(key, info));
                var body = $('<div>', { class: 'panel-body'});
                body.append(symptomSpan);
                body.append(paymentSpan);
                body.append(prescriptionDiv);
                body.append(doneButton);
                div.append(body);
                queuePanel.append(div);
                ++count;
            }
        });
};

var renderPrescription = function(visitInfo) {
    var output = $('<div>');
    var list = $('<ul>', { class: 'list-group' });
    var prescriptions = visitInfo.prescriptions;
    for (var prescription in prescriptions) {
        var item = $('<li>', { class: 'list-group-item' });
        var pInfo = prescriptions[prescription];
        var prescriptionString = pInfo.name + ' ' + pInfo.quantity;
        item.text(prescriptionString);
        list.append(item);
    }
    output.append(list);
    return output;
};

var removeFromPaymentQueue = function(queueKey) {
    firebase.database().ref('payment-queue/' + queueKey).remove();
};
