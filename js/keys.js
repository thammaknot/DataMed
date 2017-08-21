var patientKeys = {
    'first_name': { 'display' : 'ชื่อ',
                    'type': 'short_text',
                    'size': 20 },
    'last_name': { 'display' : 'นามสกุล',
                   'type': 'short_text',
                   'size': 20 },
    'phone' : { 'display' : 'เบอร์โทรศัพท์',
                'type': 'phone',
                'size': 15,
                'validate': 'phone' },
    'dob' : { 'display' : 'วันเดือนปีเกิด',
              'type': 'dob',
              'validate': 'date'},
    'address' : { 'display' : 'ที่อยู่',
                  'type': 'text' },
    'email' : { 'display' : 'อีเมล์',
                'type': 'email',
                'size': 20,
                'validate': 'email' },
    'gender' : { 'display' : 'เพศ',
                 'type': 'options',
                 'options': {
                     'male': { 'display': 'ชาย' },
                     'female': { 'display': 'หญิง' },
                 } },
};

var visitKeys = {
    'date': { 'display': 'วันที่มารับการรักษา',
              'type': 'text',
              'editable': false},
    'bp': { 'display': 'ความดันโลหิต (120/80)',
            'type': 'short_text' },
    'hr': { 'display': 'ชีพจร (ครั้ง/นาที)',
            'type': 'number' },
    'weight': { 'display': 'น้ำหนัก (กก.)',
                'type': 'number' },
    'height': { 'display': 'ส่วนสูง (ซม.)',
                'type': 'number' },
    'symptoms': { 'display': 'อาการ',
                  'type': 'text' },
    'procedures': { 'display': 'ตรวจร่างกาย',
                    'type': 'procedures' },
    'images': { 'display': 'ภาพประกอบ',
                'type': 'images' },
    'diagnosis': { 'display': 'Diagnosis',
                   'type': 'text' },
    'doctors_fee': { 'display': 'ค่าตรวจ',
                     'type': 'number' },
    'prescriptions': { 'display': 'ยา',
                       'type': 'prescriptions' },
    'equipments': { 'display': 'อุปกรณ์',
                    'type': 'equipments' },
    'treatments': { 'display': 'กายภาพบำบัด/ฝังเข็ม',
                 'type': 'treatments' },
    'cost': { 'display': 'ค่ารักษา',
              'type': 'cost' },
    'next_visit': { 'display': 'นัดครั้งหน้า',
                    'type': 'date' },
    'remarks' : { 'display': 'หมายเหตุ',
                  'type': 'text' },
};

var prescriptionKeys = {
    'name' : { 'display' : 'ชื่อยา',
               'type': 'short_text',
               'size': 30 },
    'unit_price' : { 'display' : 'ราคาต่อหน่วย',
                     'type': 'number' },
    'default_quantity' : { 'display' : 'จำนวนหน่วยทั่วไป',
                           'type' : 'number' },
    'default_usage' : { 'display' : 'วิธีใช้ทั่วไป',
                        'type' : 'usage' },
    'usage_mode' : { 'display' : 'ประเภทยา',
                     'type' : 'options',
                     'options': {
                         'eat' : { 'display' : 'ยากิน' },
                         'inject': { 'display' : 'ยาฉีด' },
                         'apply' : { 'display' : 'ยาทาภายนอก' }
                     }},
    'benefits' : { 'display' : 'สรรพคุณ',
                   'type' : 'text' },
};

var equipmentKeys = {
    'name' : { 'display': 'ชื่ออุปกรณ์',
               'type': 'short_text',
               'size': 30},
    'unit_price' : { 'display' : 'ราคาต่อหน่วย',
                     'type': 'number' },
    'default_quantity' : { 'display' : 'จำนวนหน่วยทั่วไป',
                           'type' : 'number' },
};

var treatmentKeys = {
    'name' : { 'display' : 'ชื่อการบำบัด',
               'type': 'short_text',
               'size': 30 },
    'unit_price' : { 'display' : 'ราคาต่อหน่วย',
                     'type': 'number' },
    'default_quantity' : { 'display' : 'จำนวนหน่วยทั่วไป',
                           'type' : 'number' },
};

var prescriptionUsages = ['ครั้งละ 1 เม็ด 3 ครั้ง หลังอาหาร',
                          'ครั้งละ 1 เม็ด 2 ครั้ง หลังอาหาร เช้า เย็น',
                          'ครั้งละ 1 เม็ด 1 ครั้ง หลังอาหาร เช้า',
                          'ครั้งละ 1 เม็ด 1 ครั้ง หลังอาหาร เย็น',
                          'ครั้งละ 1 เม็ด 4 ครั้ง หลังอาหาร และ ก่อนนอน',
                          'ครั้งละ 1 เม็ด 1 ครั้ง ก่อนนอน',
                          'ครั้งละ 1 เม็ด 3 ครั้ง ก่อนอาหาร',
                          'ครั้งละ 1 เม็ด 2 ครั้ง ก่อนอาหาร เช้า เย็น',
                          'ครั้งละ 1 เม็ด 1 ครั้ง ก่อนอาหาร เช้า',
                          'ครั้งละ 1 เม็ด 1 ครั้ง ก่อนอาหาร เย็น',
                          'ครั้งละ 1 เม็ด 4 ครั้ง ก่อนอาหาร และ ก่อนนอน',
                          'ครั้งละ 2 เม็ด เมื่อปวด วันละไม่เกิน 2 ครั้ง',
                          'ครั้งละ 2 เม็ด เมื่อปวด วันละไม่เกิน 3 ครั้ง',
                          'ครั้งละ 2 เม็ด เมื่อปวด วันละไม่เกิน 4 ครั้ง',
                          'ครั้งละ 2 เม็ด เมื่อปวด วันละไม่เกิน 5 ครั้ง',
                          'ครั้งละ 2 เม็ด เมื่อปวด วันละไม่เกิน 6 ครั้ง'];

var procedureKeys = {
    'name': { 'display' : 'ชื่อขั้นตอน',
              'type' : 'short_text' },
    'text': { 'display' : 'ข้อความต้นฉบับ',
              'type' : 'text' },
};
