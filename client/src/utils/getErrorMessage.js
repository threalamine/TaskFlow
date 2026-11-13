const getErrorMessage = (error) => {
    if (error.response) {
        return error.response.data?.message || 'Something went wrong';
    }

    return 'Cannot reach the server. Is it running?';
};

export default getErrorMessage;