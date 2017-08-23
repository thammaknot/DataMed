var renderReports = function(date) {
    var year = date.getYear() + 1900;
    var month = date.getMonth() + 1;
    var day = date.getDate();
    print('Here: day = ' + day + ' month = ' + month + ' year = ' + year);
    firebase.database().ref('daily-reports/' + year + '/' + month + '/' + day + '/').orderByChild('time')
        .on('value', function(data) {
            var reportPanel = $('#reportPanel');
            reportPanel.empty();
            if (!data.val()) { return; }
            var reports = data.val();
            var numPatients = 0;
            var totalRevenue = 0;
            for (var key in reports) {
                if (reports.hasOwnProperty(key)) {
                    var reportCard = renderReport(reports[key]);
                    reportPanel.append(reportCard);
                    ++numPatients;
                    totalRevenue += Number(reports[key].visit.cost);
                }
            }
            var summaryText = year + '/' + month + '/' + day + ' ';
            summaryText += STRINGS.patient + ' ' + numPatients + ' ' + STRINGS.patient_unit + ' ' + STRINGS.total_revenue + ' ' + totalRevenue + ' ' + STRINGS.currency;
            $('#reportSummary').text(summaryText);
        });
    var datePicker = $('<input>', { id: 'reportDateInput',
                                    class: 'form-control',
                                    value: day + '/' + month + '/' + year });
    $.datepicker.setDefaults(
        $.extend(
            {'dateFormat':'dd-mm-yyyy'},
            $.datepicker.regional['th']
        )
    );
    datePicker.datepicker({
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        showButtonPanel: true,
        changeMonth: true,
        minDate: null,
        maxDate: '+0d',
        yearRange: '-10:+0'
    });
    datePicker.change(function() {
        var input = datePicker.val();
        if (!input) {
            alert(STRINGS.enter_valid_date);
            return;
        }
        var tokens = input.split('/');
        if (tokens.length != 3) {
            alert(STRINGS.enter_valid_date);
            return;
        }
        renderReports(new Date(Number(tokens[2]), Number(tokens[1]) - 1, Number(tokens[0])));
    });
    var control = $('#controlPanel');
    control.empty();
    var controlText = $('<label>').text(STRINGS.pick_report_date);
    control.append(controlText);
    control.append(datePicker);
};

var renderReport = function(reportInfo) {
    var panel = $('<div>', { class: 'panel panel-primary' });
    var header = $('<div>', { class: 'panel-heading' });

    var patient = reportInfo.patient;
    header.text(patient.first_name + ' ' + patient.last_name + ' | ' + reportInfo.visit.date);

    var body = renderVisitSummary(reportInfo.visit);
    panel.append([header, body]);
    return panel;
};
