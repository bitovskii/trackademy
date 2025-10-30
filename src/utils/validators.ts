// Универсальные валидаторы для разных типов сущностей

export const createUserValidator = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.login?.trim()) {
    errors.login = 'Логин обязателен';
  } else if (data.login.length < 3) {
    errors.login = 'Логин должен содержать минимум 3 символа';
  }

  if (!data.fullName?.trim()) {
    errors.fullName = 'Полное имя обязательно';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email обязателен';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Некорректный формат email';
  }

  if (!data.password && !data.id) { // password required only for create
    errors.password = 'Пароль обязателен';
  } else if (data.password && data.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Номер телефона обязателен';
  }

  if (data.role === 1 && !data.parentPhone?.trim()) {
    errors.parentPhone = 'Номер телефона родителя обязателен для студентов';
  }

  return errors;
};

export const createRoomValidator = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Название кабинета обязательно';
  }

  if (!data.capacity || data.capacity < 1) {
    errors.capacity = 'Вместимость должна быть больше 0';
  }

  return errors;
};

export const createSubjectValidator = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Название предмета обязательно';
  }

  return errors;
};

export const createGroupValidator = (data: any) => {
  const errors: Record<string, string> = {};

  // Название, код и уровень группы не обязательны
  // if (!data.name?.trim()) {
  //   errors.name = 'Название группы обязательно';
  // }

  // if (!data.code?.trim()) {
  //   errors.code = 'Код группы обязателен';
  // }

  // if (!data.level?.trim()) {
  //   errors.level = 'Уровень обязателен';
  // }

  if (!data.subjectId?.trim()) {
    errors.subjectId = 'Предмет обязателен';
  }

  // Студенты не обязательны, но могут быть добавлены позже
  // if (!data.studentIds || data.studentIds.length === 0) {
  //   errors.studentIds = 'Выберите хотя бы одного студента';
  // }

  return errors;
};

export const createOrganizationValidator = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Название организации обязательно';
  }

  if (!data.address?.trim()) {
    errors.address = 'Адрес обязателен';
  }

  return errors;
};