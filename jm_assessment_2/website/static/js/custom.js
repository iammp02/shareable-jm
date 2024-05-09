$(document).ready(function() {	

		$(".menu-toggle").click(function() {
			$("body").toggleClass("menuOpen");
			$(".left-pannel-sidebar").toggleClass("sideBar-toggle")
		});	
 

	
	
	/*Sidebar Collapse Animation*/
	var sidebarNavCollapse = $('.left-pannel-sidebar .left-sidemenu   li .collapse');
	var sidebarNavAnchor = '.left-pannel-sidebar .left-sidemenu   li a';
	$(document).on("click",sidebarNavAnchor,function () {
		if ($(this).attr('aria-expanded') === "false")
				$(this).blur();
		$(sidebarNavCollapse).not($(this).parent().parent()).collapse('hide');
	});		
	
	/*Sidebar Collapse Animation*/
	
	
	
	
	
	
		
});








