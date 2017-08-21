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
                var body = renderVisitSummary(visit);
                var doneButton = $('<button>', { class: 'btn btn-success' });
                doneButton.append(getGlyph('ok'));
                doneButton.click(function(queueKey, queueInfo) {
                    return function() {
                        removeFromTreatmentQueue(queueKey, queueInfo);
                        addToPaymentQueue(queueKey, queueInfo);
                    };
                }(key, info));
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

var renderVisitSummary = function(visit) {
    var list = $('<ul>', { class: 'list-group' });

    var symptomItem = $('<li>', { class: 'list-group-item list-group-item-info'}).text(visit.symptoms);
    var prescriptionListItems = getPrescriptionListItems(visit);
    var treatmentListItems = getTreatmentListItems(visit);
    var nextVisitItem = $('<li>', { class: 'list-group-item list-group-item-danger'})
        .text('Next visit: ' + (visit.next_visit ? visit.next_visit : '-'));
    var costString = (visit.cost ? visit.cost : '0') + ' Baht';
    var paymentItem = $('<li>', { class: 'list-group-item list-group-item-success' });
    var costText = $('<strong>').text(costString);
    paymentItem.append(costText);
    list.append(symptomItem);
    list.append(prescriptionListItems);
    list.append(treatmentListItems);
    list.append(nextVisitItem);
    list.append(paymentItem);
    var body = $('<div>', { class: 'panel-body'});
    body.append(list);
    return body;
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
                var div = $('<div>', { class: 'panel panel-primary' });
                var header = $('<div>', { class: 'panel-heading',
                                          text: count + '. ' + patient.first_name
                                          + ' ' + patient.last_name });
                div.append(header);
                var body = renderVisitSummary(visit);

                var doneButton = $('<button>', { class: 'btn btn-success' });
                doneButton.append(getGlyph('bitcoin'));
                doneButton.append(getGlyph('ok'));
                doneButton.click(function(queueKey, queueInfo, cost) {
                    return function() {
                        showPaymentConfirmationDialog(queueKey, queueInfo, cost);
                    };
                }(key, info, visit.cost));
                body.append(doneButton);
                div.append(body);
                queuePanel.append(div);
                ++count;
            }
        });
};

var showPaymentConfirmationDialog = function(queueKey, queueInfo, cost) {
    var dialog = $('<div>', { id: 'knot', class: 'modal fade', role: 'dialog' });

    var div1 = $('<div>', { class: 'modal-dialog' });
    var div2 = $('<div>', { class: 'modal-content' });
    var header = $('<div>', { class: 'modal-header' });
    var headerText = $('<h4>', { class: 'modal-title' }).text('Confirm Payment');

    var alertText = STRINGS.have_you_received_payment1 + ' ' + cost + ' ' + STRINGS.currency + ' '
        + STRINGS.have_you_received_payment2;
    var body = $('<div>', { class: 'modal-body' }).text(alertText);
    var footer = $('<div>', { class: 'modal-footer' });
    var yesButton = $('<button>', { type: 'button', class: 'btn btn-success' }).text('Yes');
    yesButton.click(function() {
        dialog.modal('toggle');
        removeFromPaymentQueue(queueKey);
        addToDailyReport(queueKey, queueInfo);
    });

    var noButton = $('<button>', { type: 'button', class: 'btn btn-danger' }).text('No');
    noButton.click(function() {
        dialog.modal('toggle');
    });

    header.append(headerText);
    footer.append(noButton);
    footer.append(yesButton);
    div1.append(div2);
    div2.append([header, body, footer]);
    dialog.append(div1);
    dialog.modal('show');
};

var addToDailyReport = function(queueKey, queueInfo) {
    var visit = queueInfo.visit;
    var dateString = visit.date;
    var dateTokens = dateString.split(' ');
    var dateParts = dateTokens[0].split('/');
    var dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    var year = dateObj.getYear() + 1900;
    var month = dateObj.getMonth() + 1;
    var day = dateObj.getDate();
    firebase.database().ref('daily-reports/' + year + '/' +  month + '/' + day).push(queueInfo);
};

var getPrescriptionListItems = function(visitInfo) {
    var output = [];
    var prescriptions = visitInfo.prescriptions;
    for (var prescription in prescriptions) {
        var item = $('<li>', { class: 'list-group-item' });
        var pInfo = prescriptions[prescription];
        var prescriptionName = pInfo.name;
        var prescriptionQuantity = pInfo.quantity;
        var prescriptionUsage = pInfo.usage;
        var prescriptionBenefits = pInfo.benefits;
        var quantityBadge = $('<h3>', { class: 'inline' });
        quantityBadge.append($('<span>', { class: 'label label-primary' }).text(prescriptionQuantity));
        var usageBadge = $('<h3>', { class: 'inline' });
        usageBadge.append($('<span>', { class: 'label label-success' }).text(prescriptionUsage));
        var benefitBadge = $('<h3>', { class: 'inline' });
        benefitBadge.append($('<span>', { class: 'label label-info' }).text(prescriptionBenefits));
        item.text(prescriptionName);
        item.append(quantityBadge);
        item.append(usageBadge);
        item.append(benefitBadge);
        output.push(item);
    }
    return output;
};

var getTreatmentListItems = function(visitInfo) {
    var output = [];
    var treatments = visitInfo.treatments;
    for (var treatment in treatments) {
        var item = $('<li>', { class: 'list-group-item list-group-item-warning' });
        var pInfo = treatments[treatment];
        var treatmentString = pInfo.name + ' ' + pInfo.quantity;
        item.text(treatmentString);
        output.push(item);
    }
    return output;
};

var removeFromPaymentQueue = function(queueKey) {
    firebase.database().ref('payment-queue/' + queueKey).remove();
};
