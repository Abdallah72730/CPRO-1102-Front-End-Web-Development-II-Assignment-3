$(function () {
  // Tabs
  $("#tabs").tabs();

  // Pricing calculations
  $(function () {
    // Accordion 初始化
    $("#pricing-accordion").accordion({
      collapsible: true,
      heightStyle: "content",
    });

    // 价格数据
    const dogWalkingPrices = { 30: 15, 60: 30, 90: 45, 120: 60 };
    const groomingPrices = { basic: 40, full: 60, deluxe: 80 };
    const veterinaryPrices = { checkup: 60, vaccination: 80, surgery: 150 };

    // Datepicker 初始化，限制今天到30天后
    $("#dog-walking-date, #pet-grooming-date, #veterinary-date").datepicker({
      minDate: 0,
      maxDate: "+30D",
      dateFormat: "yy-mm-dd",
    });

    // 更新总价函数
    function recalculateGrandTotal() {
      let grandTotal = 0;
      $("#services-table tbody tr").each(function () {
        grandTotal +=
          parseFloat($(this).find("td.total-price").text().replace("$", "")) ||
          0;
      });
      $("#grand-total").text("$" + grandTotal);
      $("#place-order").prop("disabled", grandTotal === 0);
    }

    // 更新服务清单函数
    function updateService(
      serviceId,
      typeVal,
      qtyVal,
      dateVal,
      unitPriceData,
      priceSpanId,
      serviceName
    ) {
      let unitPrice = unitPriceData[typeVal] || 0;
      let totalPrice = unitPrice * qtyVal;
      $("#" + priceSpanId).text(unitPrice > 0 ? totalPrice : "");

      let tbody = $("#services-table tbody");
      tbody.find("tr[data-service='" + serviceName + "']").remove();

      if (unitPrice > 0 && qtyVal > 0 && typeVal && dateVal) {
        let row = `<tr data-service="${serviceName}">
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

      // bind the delete button event
      tbody
        .find(".delete-service")
        .off("click")
        .on("click", function () {
          $(this).closest("tr").remove();
          recalculateGrandTotal();
        });

      recalculateGrandTotal();
    }

    // 绑定服务事件
    function bindServiceEvents(service) {
      const {
        selectId,
        qtyId,
        dateId,
        unitPriceData,
        priceSpanId,
        serviceName,
      } = service;
      $("#" + selectId + ", #" + qtyId + ", #" + dateId).on(
        "change keyup",
        function () {
          const typeVal = $("#" + selectId).val();
          const qtyVal = parseInt($("#" + qtyId).val()) || 0;
          const dateVal = $("#" + dateId).val();
          updateService(
            selectId,
            typeVal,
            qtyVal,
            dateVal,
            unitPriceData,
            priceSpanId,
            serviceName
          );
        }
      );
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

    // 下单功能
    $("#place-order").click(function () {
      const tbody = $("#services-table tbody");
      if (tbody.find("tr").length === 0) {
        alert("Please select at least one service.");
        return;
      }

      const orderId = "order-" + new Date().getTime();

      // 生成订单表格 HTML，只取前6列，去掉 Delete 按钮
      let orderTbodyHtml = "";
      tbody.find("tr").each(function () {
        const serviceName = $(this).find("td").eq(0).text();
        const option = $(this).find("td").eq(1).text();
        const date = $(this).find("td").eq(2).text();
        const qty = $(this).find("td").eq(3).text();
        const unitPrice = $(this).find("td").eq(4).text();
        const totalPrice = $(this).find("td").eq(5).text();

        orderTbodyHtml += `
            <tr>
              <td>${serviceName}</td>
              <td>${option}</td>
              <td>${date}</td>
              <td>${qty}</td>
              <td>${unitPrice}</td>
              <td>${totalPrice}</td>
            </tr>
          `;
      });

      const orderDiv = $(`
    <div class="order-card" id="${orderId}" style="border:2px solid #1E90FF; padding:15px; margin-bottom:20px; border-radius:8px; background:#f0f8ff; position:relative;">
      <h3 style="color:#1E90FF;">Order #${orderId}</h3>
      <table style="width:100%; border-collapse: collapse; text-align:center; margin-bottom:15px;">
        <thead style="background:#87CEFA; color:#fff;">
          <tr>
            <th>Service</th>
            <th>Option / Duration</th>
            <th>Date</th>
            <th>Pets</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>${orderTbodyHtml}</tbody>
        <tfoot style="background:#f0f8ff; font-weight:bold;">
          <tr>
            <td colspan="5" style="text-align:right;">Total:</td>
            <td>${$("#grand-total").text()}</td>
          </tr>
        </tfoot>
      </table>
      <div class="progress-bar-container" style="background:#ddd; height:25px; border-radius:5px; position:relative;">
        <div class="progress-bar" style="width:0%; height:100%; background:#1E90FF; border-radius:5px;"></div>
        <span class="progress-text" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); font-weight:bold; color:#fff;">Pending</span>
      </div>
    </div>
  `);

      $("#orders-history").prepend(orderDiv);

      let orders = $("#orders-history .order-card");

      orders.each(function (i) {
        if (i < 5) {
          $(this).removeClass("hidden-order");
        } else {
          $(this).addClass("hidden-order");
        }
      });

      // reset service order form
      tbody.empty();
      $("#grand-total").text("$0");
      $("#pricing-accordion select").val("");
      $("#pricing-accordion input[type='number']").val("1");
      $("#pricing-accordion input[type='text']").val("");
      $("#pricing-accordion span[id$='-price']").text("");
      $("#place-order").prop("disabled", true);

      // 模拟进度条
      const statuses = [
        { text: "Pending", color: "#1E90FF" },
        { text: "Confirm", color: "#00CED1" },
        { text: "In Service", color: "#32CD32" },
        { text: "Completed", color: "#FF8C00" },
      ];
      let step = 0;
      const progressBar = orderDiv.find(".progress-bar");
      const progressText = orderDiv.find(".progress-text");

      progressBar.css("width", "0%");
      progressText.text(statuses[0].text);
      progressBar.css("background", statuses[0].color);

      const interval = setInterval(function () {
        step++;
        if (step >= statuses.length) {
          clearInterval(interval);
          progressBar.css("width", "100%");
          progressText.text(statuses[statuses.length - 1].text);
          progressBar.css("background", statuses[statuses.length - 1].color);
          return;
        }
        const percent = (step / (statuses.length - 1)) * 100;
        progressBar.css("width", percent + "%");
        progressText.text(statuses[step].text);
        progressBar.css("background", statuses[step].color);
      }, 5000);
    });
  });

  // Testimonials slideshow
  let testimonials = $("#testimonials .testimonial");
  let tIndex = 0;
  setInterval(function () {
    $(testimonials[tIndex]).fadeOut(800, function () {
      tIndex = (tIndex + 1) % testimonials.length;
      $(testimonials[tIndex]).fadeIn(800);
    });
  }, 4000);

  // Booking form animation
  $("#booking-form").submit(function (e) {
    e.preventDefault();
    $(this)
      .find("button")
      .animate({ width: "140px", backgroundColor: "#ff9900" }, 300)
      .animate({ width: "120px", backgroundColor: "#eee" }, 300);
    alert("Booking submitted!");
  });

  // Contact dialog
  $("#contact-btn").click(function () {
    $("#dialog").dialog();
  });
});
