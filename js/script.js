$(function () {
   /* ------------------------------
     CHECK LOGIN STATUS
  ------------------------------ */
  const currentUser = JSON.parse(localStorage.getItem('happypaw_current_user'));
  
  if (!currentUser) {
    // Redirect to login if not logged in
    window.location.href = "login.html";
    return;
  }

  // Generate random profile picture (using UI Avatars API)
  const profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff&size=40&rounded=true`;

  // Display profile section in header
  $("header").append(`
    <div style="text-align: right; margin-top: 10px; position: relative;">
      <span style="color: white; margin-right: 15px; vertical-align: middle;">Welcome, ${currentUser.name}!</span>
      <img id="profile-pic" src="${profilePicUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; vertical-align: middle; border: 2px solid white;">
      
      <div id="profile-menu" style="text-align: left; display: none; position: absolute; right: 0; top: 50px; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); min-width: 200px; z-index: 1000;">
        <div style="padding: 15px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #333;">${currentUser.name}</div>
          <div style="color: #666; font-size: 12px;">${currentUser.email}</div>
        </div>
        <div id="menu-change-name" style="padding: 12px 15px; cursor: pointer; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
          <span style="margin-right: 8px;">👤</span>Change Name
        </div>
        <div id="menu-change-email" style="padding: 12px 15px; cursor: pointer; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
          <span style="margin-right: 8px;">📧</span>Change Email
        </div>
        <div id="menu-change-password" style="padding: 12px 15px; cursor: pointer; color: #333; border-bottom: 1px solid #eee; transition: background 0.2s;">
          <span style="margin-right: 8px;">🔒</span>Change Password
        </div>
        <div id="menu-logout" style="padding: 12px 15px; cursor: pointer; color: #d9534f; font-weight: bold; transition: background 0.2s;">
          <span style="margin-right: 8px;">🚪</span>Logout
        </div>
      </div>
    </div>
  `);

  // Add hover effects to menu items
  $("#profile-menu > div:not(:first-child)").hover(
    function() {
      $(this).css("background", "#f5f5f5");
    },
    function() {
      $(this).css("background", "white");
    }
  );

  // Toggle profile menu
  $("#profile-pic").click(function (e) {
    e.stopPropagation();
    $("#profile-menu").toggle();
  });

  // Close menu when clicking outside
  $(document).click(function () {
    $("#profile-menu").hide();
  });

  // Prevent menu from closing when clicking inside it
  $("#profile-menu").click(function (e) {
    e.stopPropagation();
  });

  /* ------------------------------
     PROFILE MENU ACTIONS
  ------------------------------ */
  
  // Change Name
  $("#menu-change-name").click(function () {
    $("#profile-menu").hide();
    
    $("<div>" +
      "<p>Current name: <strong>" + currentUser.name + "</strong></p>" +
      "<label for='new-name'>New Name:</label><br>" +
      "<input type='text' id='new-name' style='width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;' placeholder='Enter new name'>" +
      "</div>").dialog({
      title: "Change Name",
      modal: true,
      width: 400,
      buttons: {
        "Update": function () {
          const newName = $("#new-name").val().trim();
          if (newName === "") {
            alert("Name cannot be empty!");
            return;
          }
          
          // Update in localStorage
          const users = JSON.parse(localStorage.getItem('happypaw_users'));
          users[currentUser.email].name = newName;
          localStorage.setItem('happypaw_users', JSON.stringify(users));
          
          currentUser.name = newName;
          localStorage.setItem('happypaw_current_user', JSON.stringify(currentUser));
          
          $(this).dialog("close");
          alert("Name updated successfully!");
          location.reload();
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    });
  });

  // Change Email
  $("#menu-change-email").click(function () {
    $("#profile-menu").hide();
    
    $("<div>" +
      "<p>Current email: <strong>" + currentUser.email + "</strong></p>" +
      "<label for='new-email'>New Email:</label><br>" +
      "<input type='email' id='new-email' style='width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;' placeholder='Enter new email'>" +
      "</div>").dialog({
      title: "Change Email",
      modal: true,
      width: 400,
      buttons: {
        "Update": function () {
          const newEmail = $("#new-email").val().trim().toLowerCase();
          if (newEmail === "") {
            alert("Email cannot be empty!");
            return;
          }
          
          const users = JSON.parse(localStorage.getItem('happypaw_users'));
          
          // Check if new email already exists
          if (users[newEmail] && newEmail !== currentUser.email) {
            alert("This email is already in use!");
            return;
          }
          
          // Move user data to new email key
          users[newEmail] = users[currentUser.email];
          users[newEmail].email = newEmail;
          delete users[currentUser.email];
          localStorage.setItem('happypaw_users', JSON.stringify(users));
          
          currentUser.email = newEmail;
          localStorage.setItem('happypaw_current_user', JSON.stringify(currentUser));
          
          $(this).dialog("close");
          alert("Email updated successfully!");
          location.reload();
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    });
  });

  // Change Password
  $("#menu-change-password").click(function () {
    $("#profile-menu").hide();
    
    $("<div>" +
      "<label for='current-password'>Current Password:</label><br>" +
      "<input type='password' id='current-password' style='width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px; box-sizing: border-box;' placeholder='Enter current password'><br>" +
      "<label for='new-password'>New Password:</label><br>" +
      "<input type='password' id='new-password' style='width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px; box-sizing: border-box;' placeholder='Enter new password (min 6 characters)'><br>" +
      "<label for='confirm-password'>Confirm New Password:</label><br>" +
      "<input type='password' id='confirm-password' style='width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;' placeholder='Confirm new password'>" +
      "</div>").dialog({
      title: "Change Password",
      modal: true,
      width: 400,
      buttons: {
        "Update": function () {
          const currentPassword = $("#current-password").val();
          const newPassword = $("#new-password").val();
          const confirmPassword = $("#confirm-password").val();
          
          if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
            alert("All fields are required!");
            return;
          }
          
          const users = JSON.parse(localStorage.getItem('happypaw_users'));
          
          // Verify current password
          if (users[currentUser.email].password !== currentPassword) {
            alert("Current password is incorrect!");
            return;
          }
          
          if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long!");
            return;
          }
          
          if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
          }
          
          // Update password
          users[currentUser.email].password = newPassword;
          localStorage.setItem('happypaw_users', JSON.stringify(users));
          
          $(this).dialog("close");
          alert("Password updated successfully!");
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    });
  });

  // Logout
  $("#menu-logout").click(function () {
    $("#profile-menu").hide();
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('happypaw_current_user');
      window.location.href = "login.html";
    }
  });


  /* ------------------------------
     TABS
  ------------------------------ */
  $("#tabs").tabs();

  let reviewsByOrder = {};

  
  /* ------------------------------
     TESTIMONIAL SLIDESHOW
  ------------------------------ */
  let testimonials = $("#testimonials .testimonial");
  let tIndex = 0;
  setInterval(function () {
    $(testimonials[tIndex]).fadeOut(800, function () {
      tIndex = (tIndex + 1) % testimonials.length;
      $(testimonials[tIndex]).fadeIn(800);
    });
  }, 4000);




  /* ------------------------------
     ACCORDION
  ------------------------------ */
  $("#pricing-accordion").accordion({
    collapsible: true,
    heightStyle: "content",
  });


  /* ------------------------------
     PRICE TABLES
  ------------------------------ */
  const dogWalkingPrices = { 30: 15, 60: 30, 90: 45, 120: 60 };
  const groomingPrices = { basic: 40, full: 60, deluxe: 80 };
  const veterinaryPrices = { checkup: 60, vaccination: 80, surgery: 150 };


  /* ------------------------------
     DATEPICKER (with min/max)
  ------------------------------ */
  $("#dog-walking-date, #pet-grooming-date, #veterinary-date").datepicker({
    minDate: 0,
    maxDate: "+30D",
    dateFormat: "yy-mm-dd",
  });


  /* ------------------------------
     GRAND TOTAL CALCULATION
  ------------------------------ */
  function recalculateGrandTotal() {
    let grandTotal = 0;
    $("#services-table tbody tr").each(function () {
      grandTotal += parseFloat($(this).find("td.total-price").text().replace("$", "")) || 0;
    });
    $("#grand-total").text("$" + grandTotal);
    $("#place-order").prop("disabled", grandTotal === 0);
  }


  /* ------------------------------
     UPDATE SERVICE ROW
  ------------------------------ */
  function updateService(selectId, typeVal, qtyVal, dateVal, unitPriceData, priceSpanId, serviceName) {

    let unitPrice = unitPriceData[typeVal] || 0;
    let totalPrice = unitPrice * qtyVal;

    $("#" + priceSpanId).text(unitPrice > 0 ? totalPrice : "");

    let tbody = $("#services-table tbody");
    tbody.find(`tr[data-service="${serviceName}"]`).remove();

    if (unitPrice > 0 && qtyVal > 0 && typeVal && dateVal) {
      let row = `
        <tr data-service="${serviceName}">
          <td>${serviceName}</td>
          <td>${typeVal}</td>
          <td>${dateVal}</td>
          <td>${qtyVal}</td>
          <td>$${unitPrice}</td>
          <td class="total-price">$${totalPrice}</td>
          <td><button class="delete-service">Delete</button></td>
        </tr>`;
      tbody.append(row);
    }

    tbody.find(".delete-service").off("click").on("click", function () {
      $(this).closest("tr").remove();
      recalculateGrandTotal();
    });

    recalculateGrandTotal();
  }


  /* ------------------------------
     BIND SERVICE EVENTS
  ------------------------------ */
  function bindServiceEvents(service) {
    const { selectId, qtyId, dateId, unitPriceData, priceSpanId, serviceName } = service;

    $("#" + selectId + ", #" + qtyId + ", #" + dateId).on("change keyup", function () {
      const typeVal = $("#" + selectId).val();
      const qtyVal = parseInt($("#" + qtyId).val()) || 0;
      const dateVal = $("#" + dateId).val();

      updateService(selectId, typeVal, qtyVal, dateVal, unitPriceData, priceSpanId, serviceName);
    });
  }

  bindServiceEvents({
    selectId: "dog-walking-duration",
    qtyId: "dog-walking-qty",
    dateId: "dog-walking-date",
    unitPriceData: dogWalkingPrices,
    priceSpanId: "dog-walking-price",
    serviceName: "Dog Walking",
  });

  bindServiceEvents({
    selectId: "pet-grooming-type",
    qtyId: "pet-grooming-qty",
    dateId: "pet-grooming-date",
    unitPriceData: groomingPrices,
    priceSpanId: "pet-grooming-price",
    serviceName: "Pet Grooming",
  });

  bindServiceEvents({
    selectId: "veterinary-type",
    qtyId: "veterinary-qty",
    dateId: "veterinary-date",
    unitPriceData: veterinaryPrices,
    priceSpanId: "veterinary-price",
    serviceName: "Veterinary",
  });


  /* ------------------------------
     VALIDATE DATE INPUT
  ------------------------------ */
  function validateAllDates() {
    let valid = true;

    $("#dog-walking-date, #pet-grooming-date, #veterinary-date").each(function () {
      let date = $(this).datepicker("getDate");

      // If user typed something invalid manually
      if (date === null && $(this).val().trim() !== "") {
        alert("Invalid date entered: " + $(this).val());
        valid = false;
        return false;
      }
    });

    return valid;
  }


  /* ------------------------------
     PLACE ORDER
  ------------------------------ */
  $("#place-order").click(function () {

    const tbody = $("#services-table tbody");

    if (tbody.find("tr").length === 0) {
      alert("Please select at least one service.");
      return;
    }

    if (!validateAllDates()) return;

    const orderId = "order-" + new Date().getTime();

    let orderTbodyHtml = "";
    tbody.find("tr").each(function () {
      orderTbodyHtml += `
        <tr>
          <td>${$(this).find("td").eq(0).text()}</td>
          <td>${$(this).find("td").eq(1).text()}</td>
          <td>${$(this).find("td").eq(2).text()}</td>
          <td>${$(this).find("td").eq(3).text()}</td>
          <td>${$(this).find("td").eq(4).text()}</td>
          <td>${$(this).find("td").eq(5).text()}</td>
        </tr>`;
    });

    const orderDiv = $(`
      <div class="order-card" id="${orderId}" style="border:2px solid #1E90FF; padding:15px; margin-bottom:20px; border-radius:8px; background:#f0f8ff;">
        <h3 style="color:#1E90FF;">Order #${orderId}</h3>

        <table style="width:100%; text-align:center; border-collapse: collapse;">
          <thead style="background:#87CEFA; color:white;">
            <tr>
              <th>Service</th>
              <th>Option</th>
              <th>Date</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${orderTbodyHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right; font-weight:bold;">Total:</td>
              <td>${$("#grand-total").text()}</td>
            </tr>
          </tfoot>
        </table><br>
        <div style="text-align:right;">
          <button class="review-btn" colspan ="5" style="text-align:right; display:none" >Submit a Review</button>
        </div>

        <div class="progress-bar-container" style="background:#ddd; height:25px; border-radius:5px; margin-top:10px;">
          <div class="progress-bar" style="width:0%; background:#1E90FF; height:100%; border-radius:5px;"></div>
          <span class="progress-text" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); color:white; font-weight:bold;">Pending</span>
        </div>
      </div>
    `);

    $("#orders-history").prepend(orderDiv);
    refreshOrderIdCombo();

    $("#orders-history .order-card").each(function (i) {
      $(this).toggleClass("hidden-order", i >= 5);
    });


    /* Reset form visually */
    tbody.empty();
    $("#grand-total").text("$0");
    $("#pricing-accordion select").val("");
    $("#pricing-accordion input[type='number']").val("1");
    $("#pricing-accordion input[type='text']").val("");
    $("span[id$='-price']").text("");
    $("#place-order").prop("disabled", true);


    /* Progress simulation */
    const statuses = [
      { text: "Pending", color: "#1E90FF" },
      { text: "Confirm", color: "#00CED1" },
      { text: "In Service", color: "#006effff" },
      { text: "Completed", color: "#32CD32" },
    ];

    let step = 0;
    const bar = orderDiv.find(".progress-bar");
    const label = orderDiv.find(".progress-text");

    const interval = setInterval(() => {
      step++;

      if (step >= statuses.length) {
        clearInterval(interval);
        bar.css("width", "100%");
        label.text("Completed");
        bar.css("background", statuses[3].color);
        $(".review-btn").show();
        // $("#reviews").show();
        return;
      }

      const percent = (step / (statuses.length - 1)) * 100;
      bar.css("width", percent + "%");
      bar.css("background", statuses[step].color);
      label.text(statuses[step].text);

    }, 1000);
  });


  /* ------------------------------
     REFRESH ORDER ID DROPDOWN
  ------------------------------ */
  function refreshOrderIdCombo() {
    $("#orderIdCombo").empty();
    $("#orders-history .order-card").each(function () {
      $("#orderIdCombo").append(`<option value="${$(this).attr("id")}">${$(this).attr("id")}</option>`);
    });
  }


  /* ------------------------------
     CONTACT DIALOG
  ------------------------------ */
  $("#contact-btn").click(function () {
    $("#dialog").dialog();
  });


 /* ------------------------------
     STAR RATING
  ------------------------------ */
  let selectedRating = 0;

  $(".star").on("mouseenter", function () {
    let value = $(this).data("value");

    $(".star").each(function () {
      $(this).toggleClass("hovered", $(this).data("value") <= value);
    });
  });

  $(".star").on("mouseleave", function () {
    $(".star").removeClass("hovered");
  });

  $(".star").on("click", function () {
    let value = $(this).data("value");
    selectedRating = value;

    $(".star").each(function () {
      let active = $(this).data("value") <= value;
      $(this).toggleClass("filled", active);
      $(this).text(active ? "★" : "☆");
    });
  });

  function returnStarString(score) {
    let s = "";
    for (let i = 0; i < 5; i++) s += (i < score ? "★" : "☆");
    return s;
  }

  /* ------------------------------
     REVIEW SYSTEM
  ------------------------------ */
  function openReviewFormDialog(orderId) {
    // Reset form
    $("#reviewer-name").val("");
    $("#review-text").val("");
    selectedRating = 0;
    $(".star").removeClass("filled").text("☆");

    $("#reviews").dialog({
      modal: true,
      width: 600,
      buttons: {
        "Submit": function () {
          let name = $("#reviewer-name").val().trim();
          let text = $("#review-text").val().trim();
          
          if (name === "" || text === "" || selectedRating === 0) {
            alert("Please fill in all fields and select a rating.");
            return;
          }

          reviewsByOrder[orderId].push({
            name: name,
            text: text,
            rating: selectedRating
          });

          $(this).dialog("close");

          // Update button text using orderId
          $("#" + orderId).find(".review-btn").text("View Reviews");

          // Show reviews dialog
          openReviewListDialog(orderId);
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    });
  }

  function openReviewListDialog(orderId) {
    let list = reviewsByOrder[orderId];
    let html = "<h3>Reviews for " + orderId + "</h3>";

    // Display existing reviews
    list.forEach(function(review) {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:5px; background:#f9f9f9;">
          <h4>${review.name}</h4>
          <p>${review.text}</p>
          <p style="color:gold; font-size:20px;">${returnStarString(review.rating)}</p>
        </div>`;
    });

    // Add "Add Another Review" button if less than 2 reviews
    if (list.length < 2) {
      html += `<button id="add-review-btn" style="margin-top:10px; padding:8px 16px;">Add Another Review</button>`;
    }

    $("#reviews-list").html(html);

    $("#reviews-list").dialog({
      modal: true,
      width: 450,
      title: "Reviews"
    });

    // Handle "Add Another Review" button click
    $("#add-review-btn").off("click").on("click", function () {
      $("#reviews-list").dialog("close");
      openReviewFormDialog(orderId);
    });
  }

  $(document).on("click", ".review-btn", function () {
    let orderId = $(this).closest(".order-card").attr("id");

    if (!reviewsByOrder[orderId]) {
      reviewsByOrder[orderId] = [];
    }

    if (reviewsByOrder[orderId].length > 0) {
      openReviewListDialog(orderId);
    } else {
      openReviewFormDialog(orderId);
    }
  });
  });