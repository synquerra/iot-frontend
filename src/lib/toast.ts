import { notifications } from '@mantine/notifications';

export const toast = {
  success: (message: string, options?: any) => {
    if (options?.id) {
      notifications.update({
        id: options.id,
        message,
        color: 'teal',
        loading: false,
        autoClose: 4000,
        ...options,
      });
      return options.id;
    }
    return notifications.show({
      message,
      color: 'teal',
      ...options,
    });
  },
  error: (message: string, options?: any) => {
    if (options?.id) {
      notifications.update({
        id: options.id,
        message,
        color: 'red',
        loading: false,
        autoClose: 4000,
        ...options,
      });
      return options.id;
    }
    return notifications.show({
      message,
      color: 'red',
      ...options,
    });
  },
  info: (message: string, options?: any) => {
    return notifications.show({
      message,
      color: 'blue',
      ...options,
    });
  },
  warning: (message: string, options?: any) => {
    return notifications.show({
      message,
      color: 'yellow',
      ...options,
    });
  },
  loading: (message: string, options?: any) => {
    const id = options?.id || Math.random().toString(36).substring(7);
    notifications.show({
      id,
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
      ...options,
    });
    return id;
  },
  dismiss: (id: string) => {
    notifications.hide(id);
  },
  // To handle the raw toast('message') calls
  show: (message: string, options?: any) => {
    return notifications.show({
      message,
      ...options,
    });
  }
};
