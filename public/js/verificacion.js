$(document).ready(() => {
  /**
   * OnlyNumbers
   * @param {Object} e Evento Keypress
   */
  function onlyNumbersEvent(e) {
    const key = window.event ? e.which : e.keyCode;
    if (key < 48 || key > 57) {
      e.preventDefault();
    }
  }

  const validateField = (ID) => {
    const input = document.getElementById(ID);
    const value = input.value;
    let regex = null;
    switch (ID) {
      case 'token':
        regex = /^[0-9]{6}$/;
        break;
      default:
        break;
    }

    if (value.length == 0) {
      $(input).removeClass('is-invalid');
      return null;
    }
    if (regex != null && regex.test(value)) {
      $(input).removeClass('is-invalid');
      return true;
    } else {
      $(input).addClass('is-invalid');
      return false;
    }
  };
  $('#token').on('keypress', onlyNumbersEvent);
  $('#token').on('input', function() {
    validateField('token');
  });
  $('#form-verificacion').on('submit', (e) => {
    e.preventDefault();
    if (!validateField('token')) {
      return;
    }
    const input = document.getElementById('token');
    $.ajax({
      'url': '/api/v1/ajax/vaccine/validation',
      'data': {'code': input.value},
      'method': 'POST',
      'beforeSend': function() {
        $('.loaderWeb').toggle();
      },
      'success': function(response) {
        console.log(response);
        $('.loaderWeb').fadeOut('slow');
        if (response.status) {
          window.location.href = '/vacuna/gracias';
        } else {
          $('#modal-error-custom-content').html(response.message);
          $('#modal-error-custom').modal('show');
        }
      },
      'error': function(response) {
        console.error('error : ', response);
        $('#modal-error').modal('show');
      },
    });
  });
});
