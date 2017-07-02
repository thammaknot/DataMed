var patientKeys = {
    'first_name': { 'display' : 'First name' },
    'last_name': { 'display' : 'Last name' },
    'phone' : { 'display' : 'Phone number' },
    'dob' : { 'display' : 'Date of birth' },
    'address' : { 'display' : 'Address' },
    'email' : { 'display' : 'Email' },
    'gender' : { 'display' : 'Gender' },
};

var visitKeys = {
    'date': { 'display': 'Date',
              'type': 'text',
              'editable': false},
    'bp_low': { 'display': 'Blood Pressure (low)',
                'type': 'number' },
    'bp_high': { 'display': 'Blood Pressure (high)',
                 'type': 'number' },
    'hr': { 'display': 'Heart Rate',
            'type': 'number' },
    'weight': { 'display': 'Weight',
                'type': 'number' },
    'height': { 'display': 'Height',
                'type': 'number' },
    'symptoms': { 'display': 'Symptoms',
                  'type': 'text' },
    'diagnosis': { 'display': 'Diagnosis',
                   'type': 'text' },
    'prescriptions': { 'display': 'Prescriptions',
                       'type': 'prescription' },
    'therapy': { 'display': 'Therapy',
                 'type': 'therapy' },
    'cost': { 'display': 'Cost',
              'type': 'number' },
    'next_visit': { 'display': 'Next Visit',
                    'type': 'date' },
    'remarks' : { 'display': 'Remarks',
                  'type': 'text' },
};

var prescriptionKeys = {
    'name' : { 'display' : 'Name',
               'type': 'short_text' },
    'price_per_unit' : { 'display' : 'Price per unit',
                         'type': 'number' },
};
