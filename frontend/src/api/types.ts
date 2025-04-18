export interface SessionAuthenticatedResponse {
    status: number,
    data: {
        user: {
            display: string,
            has_usable_password: boolean,
            id: number,
            email: string,
        },
        methods: [
            {
                method: string,
                at: number,
                email: string
            }
        ]
    },
    meta: {
        is_authenticated: boolean,
    }
}

export interface SessionUnauthenticatedResponse {
    status: number,
    data: {
        flows: [
            {
                id: string,
            }
        ],
    },
    meta: {
        is_authenticated: boolean,
    }
}

export interface ErrorResponse {
    status: number,
    errors: [
        {
            message: string,
            code: string,
            param: string
        }
    ]
}