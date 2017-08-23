/* Thai initialisation for the jQuery UI date picker plugin. */
/* Written by pipo (pipo@sixhead.com). */
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "../widgets/datepicker" ], factory );
	} else {

		// Browser globals
		factory( jQuery.datepicker );
	}
}( function( datepicker ) {

var dateBefore = null;
var valueAdjusted = false;
datepicker.regional.th = {
	closeText: "ปิด",
	prevText: "&#xAB;&#xA0;ย้อน",
	nextText: "ถัดไป&#xA0;&#xBB;",
	currentText: "วันนี้",
	monthNames: [ "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
	"กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม" ],
	monthNamesShort: [ "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
	"ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค." ],
	dayNames: [ "อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์" ],
	dayNamesShort: [ "อา.","จ.","อ.","พ.","พฤ.","ศ.","ส." ],
	dayNamesMin: [ "อา.","จ.","อ.","พ.","พฤ.","ศ.","ส." ],
	weekHeader: "Wk",
	dateFormat: "dd/mm/yy",
	firstDay: 0,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: "",
    beforeShow:function(){
        if($(this).val()!=""){
            var arrayDate=$(this).val().split("/");
            arrayDate[2]=parseInt(arrayDate[2])-543;
            $(this).val(arrayDate[0]+"/"+arrayDate[1]+"/"+arrayDate[2]);
        }
        setTimeout(function(){
            $.each($(".ui-datepicker-year option"),function(j,k){
                var textYear=parseInt($(".ui-datepicker-year option").eq(j).val())+543;
                $(".ui-datepicker-year option").eq(j).text(textYear);
            });
        },50);
    },
    onChangeMonthYear: function(){
        setTimeout(function(){
            $.each($(".ui-datepicker-year option"),function(j,k){
                var textYear=parseInt($(".ui-datepicker-year option").eq(j).val())+543;
                $(".ui-datepicker-year option").eq(j).text(textYear);
            });
        },50);
    },
    onClose:function(){
        if($(this).val()!="" && $(this).val()==dateBefore){
            var arrayDate=dateBefore.split("/");
            arrayDate[2]=parseInt(arrayDate[2])+543;
            $(this).val(arrayDate[0]+"/"+arrayDate[1]+"/"+arrayDate[2]);
        }
    },
    onSelect: function(dateText, inst){
        dateBefore=$(this).val();
        var arrayDate=dateText.split("/");
        arrayDate[2]=parseInt(arrayDate[2]) + 543;
        $(this).val(arrayDate[0]+"/"+arrayDate[1]+"/"+arrayDate[2]);
        $(this).change();
    }
};
datepicker.setDefaults( datepicker.regional.th );

return datepicker.regional.th;

} ) );
