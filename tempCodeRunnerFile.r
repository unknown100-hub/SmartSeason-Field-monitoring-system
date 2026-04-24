calculate_bmr<-function(height, weight, age, sex){
    if
    (sex == "male"){
        bmr <- 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else if
    (sex == "female"){
        bmr <- 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    } else {    stop("Invalid   sex input. Please enter 'male' or               'female
'.")    }
    return(bmr)


}
# E