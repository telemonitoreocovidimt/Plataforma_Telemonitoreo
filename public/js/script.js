/* eslint max-len: ["error", {"code":85}] */
// const ValidarSoloNumero = (valor, e) => {
//   var obj = $(valor).val();
//   tecla = document.all ? e.keyCode : e.which;
//   if (tecla == 8 || tecla == 0) return true;
//   patron = /[1234567890]/;
//   te = String.fromCharCode(tecla);
//   return patron.test(te);
// };

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

  const getFormData = () => {
    const form = document.getElementById('form');
    const inputs = Array.from(form.querySelectorAll('input'));

    const values = {};

    inputs.map((input) => {
      switch (input.getAttribute('Type')) {
        case 'text':
          values[input.name] = input.value;
          break;
        case 'radio':
          if (input.checked) values[input.name] = input.value;
          break;
        default:
          break;
      }
    });

    return values;
  };

  const validateEmpty = (value) => {
    const obj = $.trim($('#' + value).val());
    if (obj == '') {
      return true;
    } else {
      return false;
    }
  };

  const validateField = (ID) => {
    const input = document.getElementById(ID);
    const value = input.value;
    let regex = null;
    switch (ID) {
      case 'nroDNI':
        regex = /^[0-9]{8}$/;
        break;
      case 'nroCE':
        regex = /^[0-9]{9}$/;
        break;
      case 'correo':
        regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        break;
      case 'telefono':
        regex = /^[0-9]{9}$/;
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

  $('#nroDNI').on('keypress', onlyNumbersEvent);


  $('#nroDNI').on('input', function() {
    validateField('nroDNI');
  });
  $('#correo').on('input', function() {
    validateField('correo');
  });
  $('#telefono').on('input', function() {
    validateField('telefono');
  });
  $('#nroCE').on('input', function() {
    validateField('nroCE');
  });


  $('#form').on('submit', (e) => {
    e.preventDefault();
    if (!validateEmpty('correo')) {
      if (!validateField('correo')) {
        return;
      }
    }
    if (
      (validateField('nroDNI') || validateField('nroCE')) &&
       validateField('telefono')
    ) {
      const objDataForm = getFormData();
      const body = {
        'dni': objDataForm.nroDNI == ''? null: objDataForm.nroDNI,
        'email': objDataForm.correo == ''? null: objDataForm.correo,
        'ce': objDataForm.nroCE == ''? null: objDataForm.nroCE,
        'onSiteWork': objDataForm.trabajoPresencial
            .toUpperCase() == 'NO'? false : true,
        'phone': objDataForm.telefono == ''? null: objDataForm.telefono,
      };
      $.ajax({
        'url': '/api/v1/ajax/vaccine/register',
        'data': body,
        'method': 'POST',
        'beforeSend': function() {
          $('.loaderWeb').toggle();
        },
        'success': function(response) {
          $('.loaderWeb').fadeOut('slow');
          if (response.status) {
            window.location.href = '/vacuna/validar';
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
    }
  });
});
